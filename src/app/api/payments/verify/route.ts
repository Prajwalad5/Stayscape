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

    const body = await request.json();
    const { providerPaymentId, transactionId, metadata } = body;

    if (!providerPaymentId) {
      return NextResponse.json({ success: false, error: 'Missing providerPaymentId' }, { status: 400 });
    }

    // 1. Find the payment and booking
    const payment = await prisma.payment.findUnique({
      where: { providerPaymentId },
      include: { booking: { include: { property: true } } }
    });

    if (!payment) {
      return NextResponse.json({ success: false, error: 'Payment not found' }, { status: 404 });
    }

    if (payment.status === 'SUCCEEDED') {
      return NextResponse.json({ success: true, data: { status: 'SUCCEEDED' } });
    }

    // 2. Verify with provider
    const provider = getPaymentProvider();
    const verificationResult = await provider.verifyPayment({
      providerPaymentId,
      transactionId,
      amount: payment.amount,
      metadata
    });

    // 3. Update database using a transaction to ensure consistency
    const result = await prisma.$transaction(async (tx) => {
      // Update Payment
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: verificationResult.status,
          verifiedAt: verificationResult.verified ? new Date() : null,
          metadata: metadata ? metadata as any : undefined
        }
      });

      // If successful, update booking and create earnings
      if (verificationResult.status === 'SUCCEEDED') {
        await tx.booking.update({
          where: { id: payment.bookingId },
          data: {
            bookingStatus: 'CONFIRMED',
            paymentStatus: 'SUCCEEDED',
            paidAt: new Date()
          }
        });

        // Create HostEarning record if it doesn't exist
        const existingEarning = await tx.hostEarning.findUnique({
          where: { bookingId: payment.bookingId }
        });

        if (!existingEarning) {
          await tx.hostEarning.create({
            data: {
              hostId: payment.booking.property.hostId,
              bookingId: payment.bookingId,
              paymentId: payment.id,
              grossAmount: payment.amount,
              platformCommission: payment.platformFeeAmount,
              processingFee: payment.processingFee,
              netEarnings: payment.hostPayoutAmount,
              currency: payment.currency,
              status: 'PENDING',
              // Example policy: Funds available 1 day after check-in, or 1 day from now if flexible
              availableDate: payment.booking.checkIn 
                ? new Date(payment.booking.checkIn.getTime() + 24 * 60 * 60 * 1000)
                : payment.booking.startDate
                  ? new Date(payment.booking.startDate.getTime() + 24 * 60 * 60 * 1000)
                  : new Date(Date.now() + 24 * 60 * 60 * 1000)
            }
          });
        }
      } else if (verificationResult.status === 'FAILED') {
        await tx.booking.update({
          where: { id: payment.bookingId },
          data: {
            paymentStatus: 'FAILED'
          }
        });
      }

      return updatedPayment;
    });

    return NextResponse.json({ 
      success: true, 
      data: {
        status: result.status,
        verified: verificationResult.verified
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
