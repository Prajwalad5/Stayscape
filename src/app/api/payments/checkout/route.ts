export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getPaymentProvider } from '@/lib/payments';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
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
    
    const { 
      bookingId,
      paymentMethodId
    } = body;

    // 1. Fetch existing booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { property: true }
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    if (booking.guestId !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    if (booking.bookingStatus !== 'PAYMENT_PENDING') {
      return NextResponse.json({ success: false, error: 'Booking is not pending payment' }, { status: 400 });
    }

    const property = booking.property;

    // Update payment method
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentMethod: paymentMethodId,
        isDemo: paymentMethodId === 'demo',
      }
    });

    const provider = getPaymentProvider();
    
    const intentResult = await provider.createPaymentIntent({
      bookingId: booking.id,
      amount: booking.totalPrice,
      currency: property.currency,
      description: `Booking at ${property.title} for ${booking.totalNights} nights`,
    });

    if (!intentResult.success) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { bookingStatus: 'CANCELLED', paymentStatus: 'FAILED' }
      });
      return NextResponse.json({ success: false, error: 'Payment initialization failed' }, { status: 500 });
    }

    // 5. Create Payment Record
    // Since processingFee is not on booking model directly (unless it is? hostPayoutAmount is), 
    // let's derive processingFee from total accommodation + cleaning - hostPayout.
    // Or just 3% as hardcoded before.
    const processingFee = Math.round((booking.subtotal + booking.cleaningFee) * 0.03);

    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        provider: provider.name,
        providerPaymentId: intentResult.providerPaymentId,
        paymentMethod: paymentMethodId,
        amount: booking.totalPrice,
        currency: property.currency,
        status: intentResult.status as any,
        platformFeeAmount: booking.serviceFee,
        hostPayoutAmount: booking.hostPayoutAmount,
        processingFee: processingFee,
        isDemo: intentResult.isDemo
      }
    });

    // Update booking with provider payment ID
    await prisma.booking.update({
      where: { id: booking.id },
      data: { providerPaymentId: intentResult.providerPaymentId }
    });

    return NextResponse.json({ 
      success: true, 
      data: {
        bookingId: booking.id,
        paymentId: payment.id,
        ...intentResult
      }
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

