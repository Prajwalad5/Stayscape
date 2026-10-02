export const dynamic = 'force-dynamic';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { CheckoutClient } from './checkout-client';
import { getAvailablePaymentMethods } from '@/lib/payments';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Secure Checkout | StayScape',
};

interface CheckoutPageProps {
  params: { bookingId: string };
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const session = await auth();
  if (!session?.user) {
    // Should be handled by middleware, but extra safety
    return null;
  }

  const userId = (session.user as any).id;
  const bookingId = params.bookingId;

  // 1. Fetch the pending booking
  const booking = await prisma.booking.findUnique({
    where: { 
      id: bookingId,
      guestId: userId, 
      bookingStatus: 'PAYMENT_PENDING' 
    },
    include: {
      property: {
        select: {
          title: true,
          city: true,
          country: true,
          images: { take: 1, orderBy: { sortOrder: 'asc' } },
        }
      }
    }
  });

  if (!booking) {
    notFound();
  }

  // 2. Fetch available payment methods
  const methods = getAvailablePaymentMethods();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Review and confirm your rental</h1>
      <CheckoutClient booking={booking as any} methods={methods} />
    </div>
  );
}

