import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatPrice, formatDate } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EmptyState } from '@/components/shared/empty-state';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, BookOpen } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { BOOKING_STATUSES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ApproveRentButton } from './approve-button';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Rentals' };

export default async function HostReservationsPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q || '';
  const session = await auth();
  if (!session?.user) redirect('/login');

  const bookings = await prisma.booking.findMany({
    where: { 
      property: { hostId: (session.user as any).id },
      ...(q ? {
        OR: [
          { id: { contains: q } },
          { bookingNumber: { contains: q } },
          { guest: { name: { contains: q } } },
          { property: { title: { contains: q } } }
        ]
      } : {})
    },
    include: {
      property: { select: { id: true, title: true, rentalType: true } },
      guest: { select: { id: true, name: true, image: true, email: true } },
      conversation: { select: { id: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const pending = bookings.filter(b => ['PENDING', 'PENDING_APPROVAL', 'REQUESTED'].includes(b.bookingStatus));
  const upcoming = bookings.filter(b => ['APPROVED', 'PAYMENT_PENDING', 'PAYMENT_SUCCESS', 'CONFIRMED'].includes(b.bookingStatus) && new Date(b.checkIn || b.startDate || new Date(9999,0,1)) > new Date());
  const active = bookings.filter(b => ['PAYMENT_SUCCESS', 'CONFIRMED'].includes(b.bookingStatus) && new Date(b.checkIn || b.startDate || new Date()) <= new Date() && new Date(b.checkOut || b.endDate || new Date()) >= new Date());
  const past = bookings.filter(b => ['COMPLETED', 'CANCELLED', 'REFUNDED', 'EXPIRED', 'WITHDRAWN', 'REJECTED', 'CONFLICTED'].includes(b.bookingStatus) || (['PAYMENT_SUCCESS', 'CONFIRMED'].includes(b.bookingStatus) && new Date(b.checkOut || b.endDate || new Date(2000,0,1)) < new Date()));

  const renderBookings = (items: typeof bookings) => {
    if (items.length === 0) {
      return <EmptyState icon={BookOpen} title="No rentals" description="No rentals in this category." />;
    }
    return (
      <div className="space-y-4">
        {items.map((booking) => {
          const statusInfo = BOOKING_STATUSES[booking.bookingStatus as keyof typeof BOOKING_STATUSES];
          const isRental = booking.property.rentalType === 'MONTHLY' || booking.property.rentalType === 'LONG_TERM';
          return (
            <Card key={booking.id}>
              <CardContent className="flex items-start gap-4 p-4">
                <Avatar>
                  <AvatarImage src={booking.guest.image || undefined} />
                  <AvatarFallback>{getInitials(booking.guest.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{booking.guest.name}</p>
                  <div className="flex flex-wrap gap-2 mt-1 mb-2">
                    <p className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded-md">
                      Renter ID: {booking.guest.id.slice(0,8)}...
                    </p>
                    <p className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded-md">
                      Rental #: {booking.bookingNumber || booking.id.slice(0,8)}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{booking.property.title}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <CalendarDays className="h-3 w-3" />
                    {isRental ? (
                      <>Rental: {booking.checkIn ? formatDate(booking.checkIn) : 'Flexible'} — {booking.checkOut ? formatDate(booking.checkOut) : booking.endDate ? formatDate(booking.endDate) : 'Flexible'}</>
                    ) : (
                      <>{booking.checkIn ? formatDate(booking.checkIn) : 'Flexible'} - {booking.checkOut ? formatDate(booking.checkOut) : 'Flexible'}</>
                    )}
                  </p>
                </div>
                <div className="text-right shrink-0 flex flex-col items-end gap-2">
                  <Badge className={statusInfo?.color || ''}>{statusInfo?.label || booking.bookingStatus}</Badge>
                  <div>
                    <p className="text-xs text-muted-foreground text-right">{isRental ? 'Initial Total' : 'Total'}</p>
                    <p className="font-semibold">{formatPrice(booking.totalPrice)}</p>
                  </div>
                  <div className="flex gap-2 mt-1">
                    {['PENDING', 'PENDING_APPROVAL', 'REQUESTED'].includes(booking.bookingStatus) && (
                      <ApproveRentButton bookingId={booking.id} />
                    )}
                    {booking.conversation && (
                      <Link href={`/messages/${booking.conversation.id}`}>
                        <Button variant="outline" size="sm">Message Guest</Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Rental Management</h1>

      <Tabs defaultValue={pending.length > 0 ? 'pending' : 'upcoming'}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending Approval ({pending.length})
            {pending.length > 0 && <span className="ml-1 h-2 w-2 rounded-full bg-red-500 inline-block" />}
          </TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
          <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4">{renderBookings(pending)}</TabsContent>
        <TabsContent value="upcoming" className="mt-4">{renderBookings(upcoming)}</TabsContent>
        <TabsContent value="active" className="mt-4">{renderBookings(active)}</TabsContent>
        <TabsContent value="past" className="mt-4">{renderBookings(past)}</TabsContent>
        <TabsContent value="all" className="mt-4">{renderBookings(bookings)}</TabsContent>
      </Tabs>
    </div>
  );
}
