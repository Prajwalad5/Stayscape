import { prisma } from '@/lib/prisma';
import { formatPrice, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, BookOpen, Star, TrendingUp, Users, MapPin } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalRevenue,
    totalBookings,
    avgRating,
    statusCounts,
    usersLast7,
    usersLast30,
    usersTotal,
    recentBookings,
  ] = await Promise.all([
    prisma.booking.aggregate({
      where: { bookingStatus: { in: ['CONFIRMED', 'COMPLETED'] }, deletedAt: null },
      _sum: { totalPrice: true },
    }),
    prisma.booking.count({ where: { deletedAt: null } }),
    prisma.review.aggregate({ _avg: { overallRating: true } }),
    Promise.all([
      prisma.booking.count({ where: { bookingStatus: 'PAYMENT_PENDING', deletedAt: null } }),
      prisma.booking.count({ where: { bookingStatus: 'CONFIRMED', deletedAt: null } }),
      prisma.booking.count({ where: { bookingStatus: 'COMPLETED', deletedAt: null } }),
      prisma.booking.count({ where: { bookingStatus: 'CANCELLED', deletedAt: null } }),
      prisma.booking.count({ where: { paymentStatus: 'REFUNDED', deletedAt: null } }),
    ]),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo }, deletedAt: null } }),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo }, deletedAt: null } }),
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.booking.findMany({
      take: 15,
      orderBy: { createdAt: 'desc' },
      where: { deletedAt: null },
      include: {
        guest: { select: { name: true } },
        property: { select: { title: true, city: true } },
      },
    }),
  ]);

  const [pending, confirmed, completed, cancelled, refunded] = statusCounts;
  const revenue = (totalRevenue._sum?.totalPrice || 0) / 100;
  const avgBookingValue = totalBookings > 0 ? revenue / totalBookings : 0;
  const rating = avgRating._avg?.overallRating || 0;

  // Top destinations
  const topDestinations = await prisma.booking.groupBy({
    by: ['propertyId'],
    _count: { id: true },
    where: { deletedAt: null },
    orderBy: { _count: { id: 'desc' } },
    take: 5,
  });

  const topProperties = topDestinations.length > 0
    ? await prisma.property.findMany({
        where: { id: { in: topDestinations.map(d => d.propertyId) } },
        select: { id: true, city: true, country: true },
      })
    : [];

  const destinations = topDestinations.map(d => {
    const prop = topProperties.find(p => p.id === d.propertyId);
    return { city: prop?.city || 'Unknown', country: prop?.country || '', count: d._count.id };
  });

  const statusColors: Record<string, string> = {
    PENDING_PAYMENT: 'bg-orange-500',
    CONFIRMED: 'bg-green-500',
    COMPLETED: 'bg-blue-500',
    CANCELLED: 'bg-red-500',
    REFUNDED: 'bg-purple-500',
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Platform performance and insights</p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">${revenue.toFixed(2)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalBookings}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Booking Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">${avgBookingValue.toFixed(2)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{rating.toFixed(1)} / 5</div></CardContent>
        </Card>
      </div>

      {/* Row 2: Booking Analytics + Top Destinations */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Booking Status Breakdown</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Pending Payment', count: pending, color: statusColors.PENDING_PAYMENT },
                { label: 'Confirmed', count: confirmed, color: statusColors.CONFIRMED },
                { label: 'Completed', count: completed, color: statusColors.COMPLETED },
                { label: 'Cancelled', count: cancelled, color: statusColors.CANCELLED },
                { label: 'Refunded', count: refunded, color: statusColors.REFUNDED },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${item.color}`} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <span className="text-lg font-bold">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Top Destinations</CardTitle></CardHeader>
          <CardContent>
            {destinations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No booking data yet</p>
            ) : (
              <div className="space-y-4">
                {destinations.map((d, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{d.city}</p>
                      <p className="text-xs text-muted-foreground">{d.country}</p>
                    </div>
                    <Badge variant="secondary">{d.count} bookings</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Platform Growth + Recent Activity */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-4 w-4" /> Platform Growth</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last 7 days</span>
                <span className="text-lg font-bold text-green-600">+{usersLast7}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last 30 days</span>
                <span className="text-lg font-bold text-blue-600">+{usersLast30}</span>
              </div>
              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-sm font-medium">Total Users</span>
                <span className="text-lg font-bold">{usersTotal}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {recentBookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{b.property.title}</p>
                    <p className="text-xs text-muted-foreground">{b.guest.name} · {b.checkIn ? formatDate(b.checkIn) : b.startDate ? formatDate(b.startDate) : 'Flexible'} → {b.checkOut ? formatDate(b.checkOut) : b.endDate ? formatDate(b.endDate) : 'Flexible'}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={
                      b.bookingStatus === 'CONFIRMED' ? 'default' :
                      b.bookingStatus === 'CANCELLED' ? 'destructive' :
                      b.bookingStatus === 'COMPLETED' ? 'secondary' : 'outline'
                    }>
                      {b.bookingStatus.replace('_', ' ')}
                    </Badge>
                    <span className="font-semibold text-sm">{formatPrice(b.totalPrice)}</span>
                  </div>
                </div>
              ))}
              {recentBookings.length === 0 && <p className="text-sm text-muted-foreground">No bookings yet</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

