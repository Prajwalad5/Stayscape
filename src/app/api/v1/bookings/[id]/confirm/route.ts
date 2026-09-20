import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { publishUserEvent } from '@/lib/event-emitter';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }
    const userId = (session.user as any).id;

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { property: true }
    });
    
    if (!booking) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Booking not found' } },
        { status: 404 }
      );
    }
    
    if (booking.property.hostId !== userId) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }
    
    if (booking.bookingStatus !== 'PENDING' && booking.bookingStatus !== 'PENDING_APPROVAL' && booking.bookingStatus !== 'REQUESTED') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_STATE', message: 'Booking cannot be confirmed from current state' } },
        { status: 400 }
      );
    }
    
    const updated = await prisma.$transaction(async (tx: any) => {
      // CONCURRENCY CHECK: Check if there's already an approved/confirmed rental for these dates.
      if (booking.checkIn && booking.checkOut) {
        const conflicting = await tx.booking.findFirst({
          where: {
            propertyId: booking.propertyId,
            id: { not: booking.id },
            bookingStatus: { in: ['APPROVED', 'PAYMENT_PENDING', 'PAYMENT_SUCCESS', 'CONFIRMED'] },
            checkIn: { lt: booking.checkOut },
            checkOut: { gt: booking.checkIn },
          },
        });
        
        if (conflicting) {
          throw new Error('This rental period is no longer available because another rental request has already been approved.');
        }
      }
      
      // Update this booking to PAYMENT_PENDING
      const approvedBooking = await tx.booking.update({
        where: { id: params.id },
        data: {
          bookingStatus: 'PAYMENT_PENDING',
        }
      });
      
      // Mark other overlapping requests as CONFLICTED
      if (booking.checkIn && booking.checkOut) {
        await tx.booking.updateMany({
          where: {
            propertyId: booking.propertyId,
            id: { not: booking.id },
            bookingStatus: { in: ['PENDING', 'PENDING_APPROVAL', 'REQUESTED'] },
            checkIn: { lt: booking.checkOut },
            checkOut: { gt: booking.checkIn },
          },
          data: {
            bookingStatus: 'CONFLICTED',
          }
        });
      }

      // Add a notification/message for the guest
      const conversation = await tx.conversation.findFirst({
        where: { bookingId: booking.id }
      });
      
      if (conversation) {
        await tx.message.create({
          data: {
            conversationId: conversation.id,
            senderId: userId,
            content: "Your rental request has been approved by the host. Please contact the host for further details.",
          }
        });
      }

      return approvedBooking;
    });

    publishUserEvent(booking.guestId, 'NOTIFICATION', { message: 'Your rental request was approved!' });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Booking Confirm POST error:', error);
    if (error.message && error.message.includes('already been approved')) {
      return NextResponse.json(
        { success: false, error: { code: 'CONFLICT', message: error.message } },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
