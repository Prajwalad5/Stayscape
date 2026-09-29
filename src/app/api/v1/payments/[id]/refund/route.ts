export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

const refundSchema = z.object({
  amount: z.number().optional(),
  reason: z.string()
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

    let body;

    try {

      body = await request.json();

    } catch (e) {

      return NextResponse.json({ success: false, error: { code: 'INVALID_JSON', message: 'Malformed JSON body' } }, { status: 400 });

    }
    const validated = refundSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: validated.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }
    const { amount, reason } = validated.data;

    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: { booking: { include: { property: true } } }
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
    
    if (payment.status !== 'SUCCEEDED') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_STATE', message: 'Payment cannot be refunded' } },
        { status: 400 }
      );
    }
    
    const refundAmount = amount || payment.amount;

    const updated = await prisma.$transaction(async (tx: any) => {
      await tx.refund.create({
        data: {
          paymentId: payment.id,
          amount: refundAmount,
          currency: payment.currency,
          status: 'SUCCEEDED',
          reason
        }
      });
      
      await tx.transaction.create({
        data: {
          paymentId: payment.id,
          type: 'REFUND',
          amount: refundAmount,
          currency: payment.currency,
          status: 'COMPLETED'
        }
      });
      
      return await tx.payment.update({
        where: { id: payment.id },
        data: { refundedAmount: (payment.refundedAmount || 0) + refundAmount }
      });
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Payment Refund POST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
