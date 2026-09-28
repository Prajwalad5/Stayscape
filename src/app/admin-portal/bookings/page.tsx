import { prisma } from '@/lib/prisma';
import { formatPrice, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CalendarDays, Clock, CheckCircle2, BookOpen, XCircle } from 'lucide-react';
import { AdminCancelButton } from './admin-cancel-button';
import { AdminApproveButton } from './admin-approve-button';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Bookings Management | Admin Portal',
};

function getStatusBadge(status: string) {
  switch (status) {
    case 'PAYMENT_PENDING':
      return (
        <Badge className="bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100 font-medium">
          Pending Payment
        </Badge>
      );
    case 'CONFIRMED':
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100 font-medium">
          Confirmed
        </Badge>
      );
    case 'COMPLETED':
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100 font-medium">
          Completed
        </Badge>
      );
    case 'CANCELLED':
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100 font-medium">
          Cancelled
        </Badge>
      );
    case 'REFUNDED':
      return (
        <Badge className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100 font-medium">
          Refunded
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="font-medium">
          {status}
        </Badge>
      );
  }
}

function getPaymentBadge(status: string) {
  switch (status) {
    case 'COMPLETED':
    case 'PAID':
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-normal">
          {status}
        </Badge>
      );
    case 'PENDING':
    case 'CREATED':
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-normal">
          {status}
        </Badge>
      );
    case 'FAILED':
      return (
        <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 font-normal">
          {status}
        </Badge>
      );
    case 'REFUNDED':
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-normal">
          {status}
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="font-normal">
          {status}
        </Badge>
      );
  }
}

import { auth } from '@/auth';
import { hasPermission, PERMISSIONS } from '@/lib/auth/permissions';
import { redirect } from 'next/navigation';

export default async function AdminBookingsPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q || '';
  const session = await auth();
  if (!session || !hasPermission(session.user, PERMISSIONS.BOOKINGS_VIEW)) {
    redirect('/admin-portal/dashboard?error=unauthorized');
  }

  const bookings = await prisma.booking.findMany({
    include: {
      property: {
        select: {
          title: true,
          city: true,
        },
      },
      guest: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const totalCount = bookings.length;
  const pendingCount = bookings.filter((b) => b.bookingStatus === 'PAYMENT_PENDING').length;
  const confirmedCount = bookings.filter((b) => b.bookingStatus === 'CONFIRMED').length;
  const completedCount = bookings.filter((b) => b.bookingStatus === 'COMPLETED').length;
  const cancelledCount = bookings.filter((b) => b.bookingStatus === 'CANCELLED').length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Rental Management</h1>
        <p className="text-slate-500 mt-1">
          Monitor all platform rentals and manage rental cancellations.
        </p>
      </div>

      {/* Summary Row: 5 Badge-style Stat Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            <Badge variant="secondary" className="font-semibold">
              <CalendarDays className="mr-1 h-3 w-3" />
              Total
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-xs text-muted-foreground mt-1">All rentals recorded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payment</CardTitle>
            <Badge className="bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100">
              <Clock className="mr-1 h-3 w-3" />
              Pending
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting checkout payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Confirmed</CardTitle>
            <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Confirmed
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{confirmedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Active upcoming rentals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100">
              <BookOpen className="mr-1 h-3 w-3" />
              Completed
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{completedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Fulfilled customer stays</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cancelled</CardTitle>
            <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">
              <XCircle className="mr-1 h-3 w-3" />
              Cancelled
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{cancelledCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Cancelled rentals</p>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Table */}
      <Card>
        <CardHeader className="px-6 py-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">All Rentals</CardTitle>
            <Badge variant="outline" className="text-xs font-normal">
              {bookings.length} {bookings.length === 1 ? 'rental' : 'rentals'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Rental #</TableHead>
                <TableHead>Renter</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Move-in</TableHead>
                <TableHead>Move-out</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                    No rentals found.
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">
                          {booking.bookingNumber || booking.id.split('-')[0].toUpperCase()}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono mt-0.5">
                          UID: {booking.id}
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">
                          {formatDate(booking.createdAt)}
                        </span>
                      </div>
                    </TableCell>

                    {/* GUEST INFO */}
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">
                          {booking.guest?.name || 'Unknown Guest'}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono border w-fit px-1 rounded bg-slate-50 mt-1">
                          Traveller ID: {booking.guestId}
                        </span>
                      </div>
                    </TableCell>

                    {/* PROPERTY INFO */}
                    <TableCell>
                      <div className="flex flex-col max-w-[200px]">
                        <span className="font-medium text-slate-900 truncate" title={booking.property?.title}>
                          {booking.property?.title || 'Unknown Property'}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono border w-fit px-1 rounded bg-slate-50 mt-1">
                          Prop ID: {booking.propertyId}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-slate-600">
                      {booking.checkIn ? formatDate(booking.checkIn) : booking.startDate ? formatDate(booking.startDate) : 'Flexible'}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-slate-600">
                      {booking.checkOut ? formatDate(booking.checkOut) : booking.endDate ? formatDate(booking.endDate) : 'Flexible'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(booking.bookingStatus)}
                    </TableCell>
                    <TableCell>
                      {getPaymentBadge(booking.paymentStatus)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-slate-900">
                      {formatPrice(booking.totalPrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      {['PENDING_APPROVAL', 'REQUESTED', 'PENDING', 'APPROVED', 'PAYMENT_PENDING', 'PAYMENT_SUCCESS', 'CONFIRMED'].includes(booking.bookingStatus) ? (
                        <div className="flex flex-col items-end gap-2">
                          {['PENDING_APPROVAL', 'REQUESTED', 'PENDING'].includes(booking.bookingStatus) && <AdminApproveButton bookingId={booking.id} />}
                          <AdminCancelButton bookingId={booking.id} />
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">�</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
