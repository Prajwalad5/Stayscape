export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { hasPermission, PERMISSIONS } from '@/lib/auth/permissions';
import { publishUserEvent } from '@/lib/event-emitter';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user, PERMISSIONS.BOOKINGS_MODIFY)) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authorized to approve bookings' } },
        { status: 403 }
      );
    }
    const adminId = (session.user as any).id;

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
    });
    
    if (!booking) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Booking not found' } },
        { status: 404 }
      );
    }
    
    if (booking.bookingStatus !== 'PENDING' && booking.bookingStatus !== 'PENDING_APPROVAL' && booking.bookingStatus !== 'REQUESTED') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_STATE', message: 'Booking cannot be confirmed from current state' } },
        { status: 400 }
      );
    }
    
    const updated = await prisma.$transaction(async (tx: any) => {
      // CONCURRENCY CHECK
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

      return approvedBooking;
    });

    publishUserEvent(booking.guestId, 'NOTIFICATION', { message: 'Your rental request was administratively approved.' });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Admin Booking Approve POST error:', error);
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
