export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

// Use demo mode if no keys are provided
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_demo', {
  apiVersion: '2025-02-24.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature') as string;
    
    let event: Stripe.Event;
    
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // For local development without webhooks set up
      event = JSON.parse(body);
    }
    
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const bookingId = paymentIntent.metadata.bookingId;
        
        if (bookingId) {
          await prisma.booking.update({
            where: { id: bookingId },
            data: { 
              bookingStatus: 'CONFIRMED',
              paidAt: new Date()
            }
          });
          
          await prisma.payment.create({
            data: {
              bookingId,
              stripePaymentIntentId: paymentIntent.id,
              amount: paymentIntent.amount,
              platformFeeAmount: Math.round(paymentIntent.amount * 0.1),
              hostPayoutAmount: paymentIntent.amount - Math.round(paymentIntent.amount * 0.1),
              status: "SUCCEEDED", provider: "stripe", providerPaymentId: paymentIntent.id, paymentMethod: "stripe"
            }
          });
        }
        break;
      }
      // Handle transfers, refunds, etc.
    }
    
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error.message);
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }
}
