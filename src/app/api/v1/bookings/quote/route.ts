import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

const quoteSchema = z.object({
  listingId: z.string(),
  checkIn: z.string().datetime(),
  checkOut: z.string().datetime(),
  guests: z.number().int().min(1)
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    let body;

    try {

      body = await request.json();

    } catch (e) {

      return NextResponse.json({ success: false, error: { code: 'INVALID_JSON', message: 'Malformed JSON body' } }, { status: 400 });

    }
    const validated = quoteSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: validated.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }
    
    const { listingId, checkIn, checkOut, guests } = validated.data;
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    if (checkInDate >= checkOutDate) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Check-out must be after check-in' } },
        { status: 400 }
      );
    }

    const listing = await prisma.property.findUnique({ where: { id: listingId } });
    if (!listing) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Listing not found' } },
        { status: 404 }
      );
    }
    
    if (guests > listing.maxGuests) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Exceeds maximum guests' } },
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
    
    // Determine rental type and calculate duration/rate
    const rentalType = listing.rentalType || 'SHORT_TERM';
    let duration = 0;
    let baseRate = 0;
    
    // Calculate nights for short term, or generic baseline
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

    if (rentalType === 'MONTHLY' && listing.pricePerMonth) {
      // Calculate months roughly (assume 30 days = 1 month for simple quoting, or precise calendar logic if preferred)
      // For a pure rental system, usually users select specific start/end months. Here we approximate by 30 days.
      duration = Math.max(1, Math.round(nights / 30));
      baseRate = listing.pricePerMonth;
    } else if (rentalType === 'WEEKLY' && listing.pricePerWeek) {
      duration = Math.max(1, Math.round(nights / 7));
      baseRate = listing.pricePerWeek;
    } else {
      // DEFAULT: SHORT_TERM (Nightly)
      duration = nights;
      baseRate = listing.pricePerNight;
    }
    
    const subtotal = baseRate * duration;
    const cleaningFee = listing.cleaningFee || 0;
    const securityDeposit = listing.securityDeposit || 0;
    
    // Service fee based on rent
    const serviceFee = subtotal * (listing.serviceFeePercent || 0.12); 
    const tax = (subtotal + cleaningFee + serviceFee) * 0.15; 
    
    // Total price does NOT include security deposit logically in the total revenue, 
    // but the payment gateway needs the full amount to charge.
    // So totalAmountDue = subtotal + fees + tax + securityDeposit
    const total = subtotal + cleaningFee + serviceFee + tax + securityDeposit;
    const hostPayout = subtotal + cleaningFee;
    
    return NextResponse.json({
      success: true,
      data: { 
        baseRate, 
        duration, 
        rentalType, 
        nights, 
        subtotal, 
        cleaningFee, 
        securityDeposit, 
        serviceFee, 
        tax, 
        total, 
        hostPayout 
      }
    });
  } catch (error) {
    console.error('Bookings Quote POST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
