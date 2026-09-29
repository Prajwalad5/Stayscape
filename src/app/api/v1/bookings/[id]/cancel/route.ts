export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';
import { publishAdminEvent } from '@/lib/event-emitter';
import { hasPermission, PERMISSIONS } from '@/lib/auth/permissions';

const cancelSchema = z.object({
  reason: z.string().optional()
});

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
    const userRole = (session.user as any).role;
    
    const body = await request.json().catch(() => ({}));
    const validated = cancelSchema.safeParse(body);
    const reason = validated.success && validated.data.reason ? validated.data.reason : 'Cancelled by user';

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
    
    if (booking.guestId !== userId && booking.property.hostId !== userId && !hasPermission(session.user, PERMISSIONS.BOOKINGS_CANCEL)) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }
    
    if (!['PENDING_PAYMENT', 'CONFIRMED', 'REQUESTED', 'PENDING', 'PENDING_APPROVAL'].includes(booking.bookingStatus)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_STATE', message: 'Booking cannot be cancelled from current state' } },
        { status: 400 }
      );
    }
    
    const updated = await prisma.$transaction(async (tx: any) => {
      return await tx.booking.update({
        where: { id: params.id },
        data: {
          bookingStatus: 'CANCELLED',
          cancelledAt: new Date(),
          cancellationReason: reason,
          statusHistory: {
            create: { status: 'CANCELLED', changedBy: userId, note: reason }
          }
        },
        include: { property: { select: { title: true } } }
      });
    });

    await publishAdminEvent(
      'BOOKING_CANCELLED',
      updated.id,
      `Booking ${updated.bookingNumber || updated.id.slice(0, 8)} for ${updated.property.title} was cancelled`,
      { reason },
      userId
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Booking Cancel POST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
