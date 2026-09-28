import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { paymentService } from '@/lib/payments/service';
import { publishUserEvent } from '@/lib/event-emitter';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-webhook-signature');
    if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    // In real prod, we would crypto.verify the rawBody here.
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ success: false, error: { code: 'INVALID_JSON', message: 'Malformed JSON body' } }, { status: 400 });
    }
    const providerName = body.provider || 'ESEWA'; // E.g., pass this in callback URL query
    const provider = paymentService.getProvider(providerName);
    
    // In reality, body would be raw text/signature validated first
    const verification = await provider.verifyPayment(body);
    
    if (!verification.success || verification.status !== 'SUCCESS') {
      return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 400 });
    }
    
    const paymentId = body.transactionId; // Passed locally in our mock
    
    // ATOMIC PAYMENT & BOOKING CONFIRMATION
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: { booking: true }
      });
      
      if (!payment) throw new Error('Payment not found');
      if ((payment.status as any) === 'SUCCESS' || payment.status === 'COMPLETED') {
        return payment; // Idempotency
      }
      
      // Update Payment
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          providerPaymentId: verification.providerTransactionId,
          verifiedAt: new Date(),
          paidAt: new Date(),
        }
      });
      
      // Update Booking to CONFIRMED
      const booking = await tx.booking.update({
        where: { id: payment.bookingId },
        data: {
          bookingStatus: 'CONFIRMED',
          paymentStatus: 'PAID',
        }
      });
      
      // Ledger / Transaction creation
      await tx.transaction.create({
        data: {
          paymentId: payment.id,
          bookingId: booking.id,
          type: 'PAYMENT_RECEIVED',
          amount: payment.amount,
          currency: payment.currency,
          status: 'COMPLETED',
          description: `${providerName} Payment Received for Rental ${booking.id}`,
        }
      });

      // Notification
      await tx.message.create({
        data: {
          conversationId: "SYSTEM", // Placeholder for actual logic
          senderId: booking.propertyId, // Placeholder
          content: `Payment of ${payment.amount/100} ${payment.currency} successful. Rental CONFIRMED.`,
        }
      }).catch(() => {}); // Optional catch if conversation not linked here
      
      return updatedPayment;
    });

    if (result.bookingId) {
       // Optional event emit if we fetch guestId
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


