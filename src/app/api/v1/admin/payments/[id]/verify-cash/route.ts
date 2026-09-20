import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { hasPermission, PERMISSIONS } from '@/lib/auth/permissions';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user, PERMISSIONS.PAYMENTS_VIEW)) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authorized to verify cash' } },
        { status: 403 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: params.id },
      });
      
      if (!payment || payment.paymentMethod !== 'CASH_AT_OFFICE') {
        throw new Error('Invalid payment or not a cash transaction');
      }

      if (payment.status === 'COMPLETED') {
        return payment;
      }

      const receiptNumber = `CASH-${new Date().toISOString().slice(0,10).replace(/-/g, '')}-${Math.floor(Math.random()*10000).toString().padStart(4, '0')}`;

      const updated = await tx.payment.update({
        where: { id: params.id },
        data: {
          status: 'COMPLETED',
          receiptNumber,
          verifiedAt: new Date(),
          paidAt: new Date(),
        }
      });

      await tx.booking.update({
        where: { id: payment.bookingId },
        data: { bookingStatus: 'CONFIRMED', paymentStatus: 'PAID' }
      });

      await tx.transaction.create({
        data: {
          paymentId: payment.id,
          bookingId: payment.bookingId,
          type: 'PAYMENT_RECEIVED',
          amount: payment.amount,
          currency: payment.currency,
          status: 'COMPLETED',
          description: `Cash Payment Verified. Receipt: ${receiptNumber}`,
        }
      });

      return updated;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Verify Cash POST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message || 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
