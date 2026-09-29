export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(
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

    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: { booking: { include: { property: true } }, events: true, refunds: true, transactions: true }
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Payment not found' } },
        { status: 404 }
      );
    }
    
    if (payment.booking.guestId !== userId && payment.booking.property.hostId !== userId && userRole !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: payment });
  } catch (error) {
    console.error('Payment GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
