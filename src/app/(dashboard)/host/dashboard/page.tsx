export const dynamic = 'force-dynamic';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Home, DollarSign, CalendarCheck, Star, TrendingUp,
  Plus, ArrowRight, Users, Eye
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Host Dashboard' };

async function getHostStats(hostId: string) {
  const [listings, bookings, reviews, earnings] = await Promise.all([
    prisma.property.count({ where: { hostId, deletedAt: null } }),
    prisma.booking.count({ where: { property: { hostId }, bookingStatus: { in: ['CONFIRMED', 'COMPLETED'] } } }),
    prisma.review.findMany({
      where: { property: { hostId } },
      select: { overallRating: true },
    }),
    prisma.booking.aggregate({
      where: { property: { hostId }, bookingStatus: { in: ['CONFIRMED', 'COMPLETED'] } },
      _sum: { hostPayoutAmount: true },
    }),
  ]);

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length
    : 0;

  return {
    totalListings: listings,
    totalBookings: bookings,
    averageRating: avgRating,
    totalReviews: reviews.length,
    totalEarnings: (earnings._sum?.hostPayoutAmount || 0) || 0,
  };
}

async function getRecentBookings(hostId: string) {
  return prisma.booking.findMany({
    where: { property: { hostId }, bookingStatus: { in: ['PAYMENT_PENDING', 'REQUESTED', 'PENDING_APPROVAL', 'CONFIRMED'] } },
    include: {
      property: { select: { id: true, title: true } },
      guest: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
}

export default async function HostDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const userId = (session.user as any).id;

  const [stats, recentBookings] = await Promise.all([
    getHostStats(userId),
    getRecentBookings(userId),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {session.user.name}!</p>
        </div>
        <Link href="/host/listings/new">
          <Button><Plus className="mr-2 h-4 w-4" /> New Listing</Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Listings</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalListings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.totalEarnings)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">{stats.totalReviews} reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Bookings</CardTitle>
          <Link href="/host/reservations">
            <Button variant="ghost" size="sm">View all <ArrowRight className="ml-1 h-4 w-4" /></Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentBookings.length > 0 ? (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{booking.property.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.guest.name} · {new Date(booking.checkIn || booking.startDate || new Date()).toLocaleDateString()} - {new Date(booking.checkOut || booking.endDate || new Date()).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={booking.bookingStatus === 'CONFIRMED' ? 'success' : 'warning'}>
                      {booking.bookingStatus}
                    </Badge>
                    <span className="font-semibold">{formatPrice(booking.totalPrice)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No recent bookings</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
