'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { CancelBookingButton } from './cancel-button';
import { formatPrice, formatDate } from '@/lib/utils';
import { BOOKING_STATUSES } from '@/lib/constants';

interface TripCardProps {
  booking: {
    id: string;
    bookingStatus: string;
    bookingNumber: string | null;
    totalPrice: number;
    rentalType: string | null;
    checkIn: Date | null;
    checkOut: Date | null;
    startDate: Date | null;
    endDate: Date | null;
    property: {
      id: string;
      title: string;
      city: string;
      country: string;
      images: { url: string }[];
      host: { name: string | null };
    };
    conversation: { id: string } | null;
  };
}

export function TripCard({ booking }: TripCardProps) {
  const statusInfo = BOOKING_STATUSES[booking.bookingStatus as keyof typeof BOOKING_STATUSES];
  const isRental = booking.rentalType === 'MONTHLY' || booking.rentalType === 'LONG_TERM';

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
      <Link href={`/properties/${booking.property.id}`}>
        <div className="relative h-40 bg-muted">
          {booking.property.images[0] && (
            <Image src={booking.property.images[0].url} alt={booking.property.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
          )}
          <Badge className={`absolute top-2 right-2 ${statusInfo?.color || ''}`}>
            {statusInfo?.label || booking.bookingStatus}
          </Badge>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-1">{booking.property.title}</h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="h-3 w-3" /> {booking.property.city}, {booking.property.country}
          </p>
          <div className="mt-2 space-y-1">
            <p className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded-md w-fit">
              Rental #: {booking.bookingNumber || booking.id.slice(0,8)}
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Hosted by {booking.property.host.name}
          </p>
          <div className="flex items-center justify-between mt-3">
            <p className="text-sm flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {isRental ? (
                <>Rental Duration: {booking.checkIn ? formatDate(booking.checkIn) : 'Flexible'} - {booking.checkOut ? formatDate(booking.checkOut) : booking.endDate ? formatDate(booking.endDate) : 'Flexible'}</>
              ) : (
                <>{booking.checkIn ? formatDate(booking.checkIn) : 'Flexible'} - {booking.checkOut ? formatDate(booking.checkOut) : 'Flexible'}</>
              )}
            </p>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase">{isRental ? 'Initial Total' : 'Total'}</p>
              <p className="font-semibold">{formatPrice(booking.totalPrice)}</p>
            </div>
          </div>
        </CardContent>
      </Link>
      <div className="px-4 pb-4 flex gap-2 items-center">
        {booking.conversation && (
          <Link href={`/messages/${booking.conversation.id}`} className="flex-1">
            <Button variant="outline" className="w-full">Message Host</Button>
          </Link>
        )}
        {['PENDING', 'PAYMENT_PENDING', 'CONFIRMED'].includes(booking.bookingStatus) && (
          <CancelBookingButton bookingId={booking.id} />
        )}
      </div>
    </Card>
  );
}
