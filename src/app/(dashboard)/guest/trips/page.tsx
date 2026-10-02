export const dynamic = 'force-dynamic';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { EmptyState } from '@/components/shared/empty-state';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays } from 'lucide-react';
import { TripCard } from './trip-card';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'My Rentals' };

export default async function TripsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const bookings = await prisma.booking.findMany({
    where: { guestId: (session.user as any).id, deletedAt: null },
    include: {
      property: {
        select: {
          id: true, title: true, city: true, country: true,
          images: { where: { isCover: true }, take: 1 },
          host: { select: { name: true } },
        },
      },
      conversation: {
        select: { id: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  
  const requested = bookings.filter((b) => ['PENDING', 'REQUESTED', 'PENDING_APPROVAL'].includes(b.bookingStatus));
  const upcoming = bookings.filter((b) => ['APPROVED', 'PAYMENT_PENDING', 'PAYMENT_SUCCESS', 'CONFIRMED'].includes(b.bookingStatus) && new Date(b.checkIn || b.createdAt) >= new Date());

  const past = bookings.filter(b => ['COMPLETED'].includes(b.bookingStatus));
  const cancelled = bookings.filter(b => ['CANCELLED', 'REFUNDED'].includes(b.bookingStatus));

  const renderTrips = (items: typeof bookings) => {
    if (items.length === 0) {
      return <EmptyState icon={CalendarDays} title="No rentals" description="When you rent a property, it will appear here." actionLabel="Explore rentals" actionHref="/search" />;
    }
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((booking) => (
          <TripCard key={booking.id} booking={booking as any} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Rentals</h1>
      <Tabs defaultValue="requested">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelled.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="requested" className="mt-4">{renderTrips(requested)}</TabsContent>
        <TabsContent value="upcoming" className="mt-4">{renderTrips(upcoming)}</TabsContent>
        <TabsContent value="past" className="mt-4">{renderTrips(past)}</TabsContent>
        <TabsContent value="cancelled" className="mt-4">{renderTrips(cancelled)}</TabsContent>

      </Tabs>
    </div>
  );
}
