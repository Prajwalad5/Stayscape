import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';
import crypto from 'crypto';
import { publishAdminEvent } from '@/lib/event-emitter';

const bookingSchema = z.object({
  listingId: z.string(),
  checkIn: z.string().datetime(),
  checkOut: z.string().datetime(),
  adults: z.number().int().min(1),
  children: z.number().int().min(0).default(0),
  infants: z.number().int().min(0).default(0),
  pets: z.number().int().min(0).default(0),
  specialRequests: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }
    const userId = (session.user as any).id;
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20'), 100);
    
    const where: any = { guestId: userId };
    if (status) where.bookingStatus = status;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          property: {
            select: { 
              title: true, city: true, country: true, images: true,
              host: { select: { id: true, name: true, email: true, image: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.booking.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: bookings,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
    });
  } catch (error) {
    console.error('Bookings GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }
    const userId = (session.user as any).id;

    let body;

    try {

      body = await request.json();

    } catch (e) {

      return NextResponse.json({ success: false, error: { code: 'INVALID_JSON', message: 'Malformed JSON body' } }, { status: 400 });

    }
    const validated = bookingSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: validated.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }
    
    const { listingId, checkIn, checkOut, adults, children, infants, pets, specialRequests } = validated.data;
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    if (checkInDate >= checkOutDate) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Check-out must be after check-in' } },
        { status: 400 }
      );
    }

    const listing = await prisma.property.findUnique({ where: { id: listingId } });
    if (!listing || listing.status !== 'PUBLISHED' || listing.deletedAt !== null) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Listing not available' } },
        { status: 404 }
      );
    }
    if (listing.hostId === userId) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Cannot book your own property' } },
        { status: 403 }
      );
    }
    
    const guestCount = adults + children + infants;
    if (guestCount > listing.maxGuests) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Guest count exceeds maximum allowed' } },
        { status: 400 }
      );
    }
    
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    if (listing.minNights && nights < listing.minNights) {
       return NextResponse.json(
         { success: false, error: { code: 'VALIDATION_ERROR', message: `Minimum ${listing.minNights} nights required` } },
         { status: 400 }
       );
    }
    if (listing.maxNights && nights > listing.maxNights) {
       return NextResponse.json(
         { success: false, error: { code: 'VALIDATION_ERROR', message: `Maximum ${listing.maxNights} nights allowed` } },
         { status: 400 }
       );
    }

    const overlapping = await prisma.booking.findFirst({
      where: {
        propertyId: listingId,
        bookingStatus: { in: ['PAYMENT_PENDING', 'CONFIRMED'] },
        AND: [
          { checkIn: { lt: checkOutDate } },
          { checkOut: { gt: checkInDate } }
        ]
      }
    });
    if (overlapping) {
      return NextResponse.json(
        { success: false, error: { code: 'CONFLICT', message: 'Dates are already booked' } },
        { status: 409 }
      );
    }
    
    const blockedDates = await prisma.availability.findFirst({
      where: {
        propertyId: listingId,
        isAvailable: false,
        date: { gte: checkInDate, lt: checkOutDate }
      }
    });
    if (blockedDates) {
      return NextResponse.json(
        { success: false, error: { code: 'CONFLICT', message: 'Some dates are blocked' } },
        { status: 409 }
      );
    }

    // Determine rental type and calculate duration/rate
    const rentalType = listing.rentalType || 'SHORT_TERM';
    let duration = 0;
    let baseRate = 0;
    
    if (rentalType === 'MONTHLY' && listing.pricePerMonth) {
      duration = Math.max(1, Math.round(nights / 30));
      baseRate = listing.pricePerMonth;
    } else if (rentalType === 'WEEKLY' && listing.pricePerWeek) {
      duration = Math.max(1, Math.round(nights / 7));
      baseRate = listing.pricePerWeek;
    } else {
      duration = nights;
      baseRate = listing.pricePerNight;
    }

    const nightlyRate = baseRate; // Map baseRate to existing nightlyRate field for compatibility
    const subtotal = baseRate * duration;
    const cleaningFee = listing.cleaningFee || 0;
    const securityDeposit = listing.securityDeposit || 0;
    const serviceFee = subtotal * (listing.serviceFeePercent || 0.12); 
    const tax = (subtotal + cleaningFee + serviceFee) * 0.15; 
    const discount = 0;
    const total = subtotal + cleaningFee + serviceFee + tax + securityDeposit - discount;
    const hostPayout = subtotal + cleaningFee;
    
    const year = new Date().getFullYear();
    const randomDigits = crypto.randomInt(100000, 999999);
    const bookingNumber = `RENT-${year}-${randomDigits}`;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const booking = await prisma.$transaction(async (tx: any) => {
      return await tx.booking.create({
        data: {
          bookingNumber,
          propertyId: listingId,
          guestId: userId,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          totalNights: nights,
          guestCount: adults + children,
          adults, children, infants, pets,
          specialRequests,
          bookingStatus: 'PAYMENT_PENDING',
          expiresAt,
          nightlyRate, subtotal, cleaningFee, serviceFee, taxAmount: tax, discount, totalPrice: total, hostPayoutAmount: hostPayout,
          
          // Rental Fields
          rentalType,
          securityDepositAmount: securityDeposit,
          securityDepositStatus: securityDeposit > 0 ? 'PENDING' : null,
          durationMonths: rentalType === 'MONTHLY' ? duration : null,

          guests: {
            create: [
              { guestType: 'adult', count: adults },
              ...(children > 0 ? [{ guestType: 'child', count: children }] : []),
              ...(infants > 0 ? [{ guestType: 'infant', count: infants }] : []),
              ...(pets > 0 ? [{ guestType: 'pet', count: pets }] : [])
            ]
          },
          statusHistory: {
            create: { status: 'PAYMENT_PENDING', changedBy: 'GUEST', note: 'Initial rental creation' }
          }
        },
        include: { property: true, guest: { select: { name: true } } }
      });
    });

    // Publish Real-Time Event for Admin Dashboard
    await publishAdminEvent(
      'BOOKING_CREATED',
      booking.id,
      `New booking created for ${booking.property.title} by ${booking.guest.name}`,
      { bookingNumber: booking.bookingNumber },
      userId
    );

    return NextResponse.json({ success: true, data: booking }, { status: 201 });
  } catch (error) {
    console.error('Bookings POST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
