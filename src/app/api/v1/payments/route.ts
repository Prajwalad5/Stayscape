export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

const paymentSchema = z.object({
  bookingId: z.string(),
  paymentMethod: z.string(),
  idempotencyKey: z.string()
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
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20'), 100);
    
    const where = { booking: { guestId: userId } };
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: { booking: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.payment.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: payments,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
    });
  } catch (error) {
    console.error('Payments GET error:', error);
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
    const validated = paymentSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: validated.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }
    
    const { bookingId, paymentMethod, idempotencyKey } = validated.data;

    const existingPayment = await prisma.payment.findUnique({
      where: { idempotencyKey }
    });
    if (existingPayment) {
      return NextResponse.json({ success: true, data: existingPayment });
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Booking not found' } },
        { status: 404 }
      );
    }
    
    if (booking.guestId !== userId) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }
    
    if (booking.bookingStatus !== 'PAYMENT_PENDING') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_STATE', message: 'Booking is not pending payment' } },
        { status: 400 }
      );
    }

    const payment = await prisma.$transaction(async (tx: any) => {
      const p = await tx.payment.create({
        data: {
          bookingId,
          userId,
          amount: booking.totalPrice,
          currency: 'usd',
          status: 'SUCCEEDED',
          provider: 'stripe',
          providerPaymentId: idempotencyKey,
          paymentMethod,
          platformFeeAmount: booking.serviceFee,
          hostPayoutAmount: booking.hostPayoutAmount,
          events: {
            create: { 
              provider: 'stripe', 
              eventType: 'payment_intent.succeeded',
              processed: true
            }
          }
        }
      });
      
      await tx.transaction.create({
        data: {
          paymentId: p.id,
          bookingId: booking.id,
          type: 'CHARGE',
          amount: booking.totalPrice,
          currency: 'usd',
          status: 'COMPLETED',
          description: 'Initial booking payment'
        }
      });
      
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          bookingStatus: 'CONFIRMED',
          statusHistory: {
            create: { status: 'CONFIRMED', changedById: userId, note: 'Payment processed' }
          }
        }
      });
      return p;
    });

    return NextResponse.json({ success: true, data: payment }, { status: 201 });
  } catch (error) {
    console.error('Payments POST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
