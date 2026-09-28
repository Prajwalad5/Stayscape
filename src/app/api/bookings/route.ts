import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { createBookingSchema } from '@/lib/validators/booking';
import { publishUserEvent } from '@/lib/event-emitter';

// POST /api/bookings - Create a booking
export async function POST(request: Request) {
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
    const validated = createBookingSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: validated.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const { propertyId, checkIn, checkOut, guestCount, specialRequests } = validated.data;

    // Get property with SERVER-SIDE pricing
    const property = await prisma.property.findUnique({
      where: { id: propertyId, status: 'PUBLISHED', deletedAt: null },
    });

    if (!property) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Property not found or unavailable' } },
        { status: 404 }
      );
    }

    
      // Prevent duplicate pending requests from the same user for the same property
      const existingPending = await prisma.booking.findFirst({
        where: {
          propertyId,
          guestId: userId,
          bookingStatus: { in: ['PAYMENT_PENDING', 'PENDING_APPROVAL', 'REQUESTED'] },
        }
      });
      
      if (existingPending) {
        return NextResponse.json(
          { success: false, error: { code: 'CONFLICT', message: 'You already have a pending request for this property.' } },
          { status: 409 }
        );
      }

      // Prevent booking own property
    if (property.hostId === userId) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Cannot book your own property' } },
        { status: 403 }
      );
    }

    // Validate guest count
    if (guestCount > property.maxGuests) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: `Maximum ${property.maxGuests} guests allowed` } },
        { status: 400 }
      );
    }

    // Calculate duration based on dates OR default to minimum stay
    const rentalType = property.rentalType || 'SHORT_TERM';
    const isRental = rentalType === 'MONTHLY' || rentalType === 'LONG_TERM' || rentalType === 'WEEKLY';

    let checkInDate = checkIn || validated.data.startDate;
    let checkOutDate = checkOut || validated.data.endDate;

    if (property.requiresCheckIn && !checkInDate && !isRental) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Check-in date is required for this property' } }, { status: 400 });
    }
    if (property.requiresCheckOut && !checkOutDate && !isRental) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Check-out date is required for this property' } }, { status: 400 });
    }

    let nights = property.minNights || 1;
    if (checkInDate && checkOutDate) {
      nights = Math.max(1, Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));
    } else {
      // Create flexible default dates
      checkInDate = checkInDate || new Date();
      checkOutDate = checkOutDate || new Date(checkInDate.getTime() + nights * 24 * 60 * 60 * 1000);
    }

    // Validate stay length
    if (nights < property.minNights) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: `Minimum duration is ${property.minNights}` } },
        { status: 400 }
      );
    }

    if (nights > property.maxNights) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: `Maximum duration is ${property.maxNights}` } },
        { status: 400 }
      );
    }

    // Check for overlapping bookings (prevent double booking)
    if (checkInDate && checkOutDate) {
      const overlapping = await prisma.booking.findFirst({
        where: {
          propertyId,
          bookingStatus: { in: ['APPROVED', 'PAYMENT_PENDING', 'PAYMENT_SUCCESS', 'CONFIRMED'] },
          checkIn: { lt: checkOutDate },
          checkOut: { gt: checkInDate },
        },
      });

      if (overlapping) {
        return NextResponse.json(
          { success: false, error: { code: 'CONFLICT', message: 'These dates are not available' } },
          { status: 409 }
        );
      }

      // Check blocked dates
      const blockedDates = await prisma.availability.findFirst({
        where: {
          propertyId,
          isAvailable: false,
          date: { gte: checkInDate, lt: checkOutDate },
        },
      });

      if (blockedDates) {
        return NextResponse.json(
          { success: false, error: { code: 'CONFLICT', message: 'Some dates are blocked by the host' } },
          { status: 409 }
        );
      }
    }

    // SERVER-SIDE price calculation with DYNAMIC COMMISSION
    
    let duration = 0;
    let baseRate = 0;
    let subtotal = 0;
    let serviceFee = 0;
    let cleaningFee = property.cleaningFee || 0;
    let advance = 0;
    const securityDeposit = property.securityDeposit || 0;
    const taxAmount = 0;
    let totalPrice = 0;
    let processingFee = 0;
    let hostPayoutAmount = 0;
    
    // Fetch active commission rule
    const rule = await prisma.commissionRule.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" }
    });
    const guestFeePercent = rule ? rule.guestServiceFeePercent : 10;
    const hostCommPercent = rule ? rule.hostCommissionPercent : 3;
    
    if (isRental) {
      if (rentalType === 'MONTHLY' || rentalType === 'LONG_TERM') {
        baseRate = property.pricePerMonth || 0;
        duration = body.durationMonths || 1;
      } else if (rentalType === 'WEEKLY') {
        baseRate = property.pricePerWeek || 0;
        duration = body.durationMonths || 1;
      }
      
      let initialRent = baseRate;
      if (property.advanceRequired) {
        if (property.advanceType === 'MONTHS' && property.advanceAmount) {
          advance = baseRate * property.advanceAmount;
        } else if (property.advanceType === 'FIXED' && property.advanceAmount) {
          advance = property.advanceAmount;
        }
      }
      
      subtotal = initialRent;
      totalPrice = initialRent + advance + securityDeposit;
      serviceFee = 0; // Rentals typically do not have hotel service fees per night
      cleaningFee = 0; 
      
      processingFee = Math.round(totalPrice * (hostCommPercent / 100));
      hostPayoutAmount = totalPrice - processingFee;
    } else {
      duration = nights;
      baseRate = property.pricePerNight;
      subtotal = baseRate * duration;
      serviceFee = Math.round(subtotal * (guestFeePercent / 100));
      totalPrice = subtotal + cleaningFee + serviceFee + taxAmount + securityDeposit;
      
      processingFee = Math.round((subtotal + cleaningFee) * (hostCommPercent / 100));
      hostPayoutAmount = subtotal + cleaningFee - processingFee;
    }

    const nightlyRate = baseRate; // map for backward compatibility

    const booking = await prisma.$transaction(async (tx) => {
      // Double-check availability within transaction
      if (checkInDate && checkOutDate) {
        const conflicting = await tx.booking.findFirst({
          where: {
            propertyId,
            bookingStatus: { in: ['APPROVED', 'PAYMENT_PENDING', 'PAYMENT_SUCCESS', 'CONFIRMED'] },
            checkIn: { lt: checkOutDate },
            checkOut: { gt: checkInDate },
          },
        });

        if (conflicting) {
          throw new Error('DOUBLE_BOOKING');
        }
      }

      const newBooking = await tx.booking.create({
        data: {
          propertyId,
          guestId: userId,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          startDate: checkInDate,
          endDate: checkOutDate,
          totalNights: nights,
          guestCount,
          nightlyRate,
          subtotal,
          cleaningFee,
          serviceFee,
          taxAmount,
          totalPrice,
          hostPayoutAmount,
          specialRequests,
          currency: property.currency,
          bookingStatus: 'PENDING_APPROVAL',
          paymentStatus: 'CREATED',
          
          // Rental Fields
          rentalType,
          securityDepositAmount: securityDeposit,
          securityDepositStatus: securityDeposit > 0 ? 'PAYMENT_PENDING' : null,
          durationMonths: rentalType === 'MONTHLY' ? duration : null,

          isDemo: false,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000)
        },
        include: {
          property: { select: { title: true, city: true, country: true } },
          guest: { select: { id: true, name: true } },
        },
      });

      // --- AUTOMATED MESSAGING SYSTEM ---
      
      // 1. Create Conversation
      const conversation = await tx.conversation.create({
        data: {
          propertyId,
          bookingId: newBooking.id,
          type: 'RENTAL',
          participants: {
            create: [
              { userId: userId, role: 'GUEST' },
              { userId: property.hostId, role: 'HOST' }
            ]
          }
        }
      });

      // 2. Create System Message for Guest
      const guestMessageContent = `Thank you for renting ${property.title}.\nYour rental request has been created successfully.\n\nRental ID: ${newBooking.id}\nProperty ID: ${property.id}\nProperty: ${property.title}\nStatus: PENDING_APPROVAL\n\nFor further questions or communication, you can contact the host through this conversation.\nThank you.`;
      await tx.message.create({
        data: {
          conversationId: conversation.id,
          senderId: property.hostId, // Using host as sender for system messages
          messageType: 'SYSTEM_GUEST_CONFIRMATION',
          content: guestMessageContent,
          isSystem: true,
        }
      });

      // 3. Create System Message for Host
      const hostMessageContent = `Your property has received a new rental request.\n\nRental ID: ${newBooking.id}\nProperty ID: ${property.id}\nProperty: ${property.title}\nGuest: ${newBooking.guest.name || 'Unknown'}\nGuest ID: ${userId}\n\nFor further communication regarding this rental, you can contact the guest through this conversation.`;
      await tx.message.create({
        data: {
          conversationId: conversation.id,
          senderId: userId, // Using guest as sender for system messages
          messageType: 'SYSTEM_HOST_NOTIFICATION',
          content: hostMessageContent,
          isSystem: true,
        }
      });

      // 4. Create Notifications
      await tx.notification.createMany({
        data: [
          {
            userId,
            type: 'RENTAL_CREATED',
            title: 'Rental Request Created',
            message: `Your request for ${property.title} was created.`,
            link: `/guest/trips`,
          },
          {
            userId: property.hostId,
            type: 'NEW_RENTAL_REQUEST',
            title: 'New Rental Request',
            message: `${newBooking.guest.name} requested to rent ${property.title}.`,
            link: `/host/reservations`,
          }
        ]
      });

      return newBooking;
    });

    // --- TRIGGER REALTIME EVENTS (Post-Transaction) ---
    publishUserEvent(userId, 'NEW_MESSAGE', { conversationId: booking.id });
    publishUserEvent(property.hostId, 'NEW_MESSAGE', { conversationId: booking.id });

    return NextResponse.json({ success: true, data: booking }, { status: 201 });
  } catch (error: any) {
    if (error?.message === 'DOUBLE_BOOKING') {
      return NextResponse.json(
        { success: false, error: { code: 'CONFLICT', message: 'These dates are no longer available' } },
        { status: 409 }
      );
    }
    console.error('Booking create error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create booking' } },
      { status: 500 }
    );
  }
}

// GET /api/bookings - List user's bookings
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

    const bookings = await prisma.booking.findMany({
      where: { guestId: userId, deletedAt: null },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            city: true,
            country: true,
            images: { where: { isCover: true }, take: 1 },
            host: { select: { id: true, name: true, image: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Bookings GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch bookings' } },
      { status: 500 }
    );
  }
}

