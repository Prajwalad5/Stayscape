export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  UserCheck,
  Building,
  BookOpen,
  CalendarCheck,
  CalendarX,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  LifeBuoy,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from 'lucide-react';

const STATUS_METADATA: Record<
  string,
  { label: string; badgeClass: string; barColor: string; icon: React.ReactNode }
> = {
  PENDING_PAYMENT: {
    label: 'Pending Payment',
    badgeClass: 'border-amber-200 bg-amber-50 text-amber-700',
    barColor: 'bg-amber-500',
    icon: <Clock className="h-3.5 w-3.5 text-amber-500" />,
  },
  CONFIRMED: {
    label: 'Confirmed',
    badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    barColor: 'bg-emerald-500',
    icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
  },
  COMPLETED: {
    label: 'Completed',
    badgeClass: 'border-blue-200 bg-blue-50 text-blue-700',
    barColor: 'bg-blue-500',
    icon: <CalendarCheck className="h-3.5 w-3.5 text-blue-500" />,
  },
  CANCELLED: {
    label: 'Cancelled',
    badgeClass: 'border-rose-200 bg-rose-50 text-rose-700',
    barColor: 'bg-rose-500',
    icon: <XCircle className="h-3.5 w-3.5 text-rose-500" />,
  },
  REFUNDED: {
    label: 'Refunded',
    badgeClass: 'border-purple-200 bg-purple-50 text-purple-700',
    barColor: 'bg-purple-500',
    icon: <RotateCcw className="h-3.5 w-3.5 text-purple-500" />,
  },
};

function renderStatusBadge(status: string) {
  const meta = STATUS_METADATA[status];
  if (!meta) {
    return <Badge variant="outline">{status}</Badge>;
  }
  return (
    <Badge variant="outline" className={`font-medium ${meta.badgeClass}`}>
      {status}
    </Badge>
  );
}

import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function AdminDashboardPage() {
  const session = await auth();
  const user = session?.user as any;
  if (!user || (user.role !== 'ADMIN' && !user.adminRole)) redirect('/login');
  
  if (user.adminRole === 'BOOKING_ADMIN') redirect('/admin-portal/bookings');
  if (user.adminRole === 'LISTING_ADMIN') redirect('/admin-portal/listings');
  
  const [
    totalUsers,
    activeHosts,
    publishedListings,
    totalBookings,
    activeBookings,
    cancelledBookings,
    revenueStats,
    statusGroupCounts,
    openDisputesCount,
    openTicketsCount,
    recentBookings,
    recentListings,
    listingFeesSum,
  ] = await Promise.all([
    // Row 1
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { isHost: true, deletedAt: null } }),
    prisma.property.count({ where: { status: 'PUBLISHED', deletedAt: null } }),
    prisma.booking.count({ where: { deletedAt: null } }),

    // Row 2
    prisma.booking.count({ where: { bookingStatus: 'CONFIRMED', deletedAt: null } }),
    prisma.booking.count({ where: { bookingStatus: 'CANCELLED', deletedAt: null } }),
    prisma.booking.aggregate({
      where: {
        bookingStatus: { in: ['CONFIRMED', 'COMPLETED'] },
        deletedAt: null,
      },
      _sum: {
        totalPrice: true,
        serviceFee: true,
      },
    }),

    // Row 3: Status Breakdown
    prisma.booking.groupBy({
      by: ['bookingStatus'],
      where: { deletedAt: null },
      _count: { _all: true },
    }),

    // Row 4
    prisma.dispute.count({ where: { status: 'OPEN' } }),
    prisma.supportTicket.count({ where: { status: 'OPEN' } }),

    // Row 3: Recent Bookings
    prisma.booking.findMany({
      take: 10,
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        guest: { select: { name: true, email: true, id: true } },
        property: { select: { title: true, hostId: true } },
      },
    }),

    // Recent Listings
    prisma.property.findMany({
      take: 10,
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        host: { select: { name: true, id: true } }
      }
    }),

    // Listing Fees Revenue
    prisma.transaction.aggregate({
      where: {
        type: 'LISTING_FEE',
        status: 'COMPLETED'
      },
      _sum: {
        amount: true
      }
    })
  ]);

  // Aggregate breakdown counts for each required status
  const breakdownStatuses = [
    'PAYMENT_PENDING',
    'CONFIRMED',
    'COMPLETED',
    'CANCELLED',
    'REFUNDED',
  ] as const;

  const statusCountMap: Record<string, number> = {
    PENDING_PAYMENT: 0,
    CONFIRMED: 0,
    COMPLETED: 0,
    CANCELLED: 0,
    REFUNDED: 0,
  };

  statusGroupCounts.forEach((group) => {
    if (group.bookingStatus && group.bookingStatus in statusCountMap) {
      statusCountMap[group.bookingStatus] = group._count._all;
    }
  });

  const totalRevenueInCents = (revenueStats._sum?.totalPrice || 0) + (listingFeesSum._sum?.amount || 0);
  const platformFeesInCents = (revenueStats._sum?.serviceFee || 0) + (listingFeesSum._sum?.amount || 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time dynamic overview of platform performance, bookings, and operations.
        </p>
      </div>

      {/* Row 1: Core Platform Metrics (4 cards) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered platform accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Hosts
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeHosts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalUsers > 0 ? ((activeHosts / totalUsers) * 100).toFixed(1) : 0}% of total users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Published Listings
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedListings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Active & searchable properties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Rentals
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">All-time rental volume</p>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Booking Status & Financial Overview (4 cards) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Rentals (CONFIRMED)
            </CardTitle>
            <CalendarCheck className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">
              {activeBookings.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Upcoming & confirmed stays</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cancelled Rentals
            </CardTitle>
            <CalendarX className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-700">
              {cancelledBookings.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalBookings > 0 ? ((cancelledBookings / totalBookings) * 100).toFixed(1) : 0}%
              cancellation rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-slate-900" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalRevenueInCents)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From confirmed & completed rentals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Platform Fees
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {formatPrice(platformFeesInCents)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Net service & listing fee earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Recent Bookings & Listings Tables */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Recent Bookings Table */}
        <Card className="lg:col-span-12">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Recent Rentals</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Latest rentals processed on the platform
                </p>
              </div>
              <a href="/admin-portal/bookings" className="text-sm text-blue-600 hover:underline">View All Rentals</a>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rental Ref</TableHead>
                    <TableHead>Guest & IDs</TableHead>
                    <TableHead>Listing</TableHead>
                    <TableHead>Check-In</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No rentals recorded yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div className="font-semibold text-slate-900">{booking.bookingNumber || 'N/A'}</div>
                          <div className="text-[10px] text-muted-foreground font-mono mt-0.5">UID: {booking.id}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-slate-900 truncate max-w-[170px]">
                            {booking.guest?.name || 'Guest'}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono mt-0.5 border w-fit px-1 rounded bg-slate-50">
                            Traveller ID: {booking.guestId}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-slate-900 truncate max-w-[200px]" title={booking.property?.title || 'Unknown Property'}>
                            {booking.property?.title || 'Unknown Property'}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono mt-0.5 border w-fit px-1 rounded bg-slate-50">
                            Prop ID: {booking.propertyId}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600 whitespace-nowrap">
                          {new Date(booking.checkIn || booking.startDate || new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </TableCell>
                        <TableCell>
                          {renderStatusBadge(booking.bookingStatus)}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-slate-900">
                          {formatPrice(booking.totalPrice)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Listings Table */}
        <Card className="lg:col-span-12">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Recent Listings</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Latest properties added to the platform
                </p>
              </div>
              <a href="/admin-portal/listings" className="text-sm text-blue-600 hover:underline">View All Listings</a>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Listing Ref</TableHead>
                    <TableHead>Property Title</TableHead>
                    <TableHead>Host & IDs</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Price/Night</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentListings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No listings recorded yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentListings.map((listing) => (
                      <TableRow key={listing.id}>
                        <TableCell>
                          <div className="text-[10px] text-muted-foreground font-mono mt-0.5 border w-fit px-1 rounded bg-slate-50">
                            UID: {listing.id}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-slate-900 truncate max-w-[240px]">
                            {listing.title}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-slate-900 truncate max-w-[170px]">
                            {listing.host?.name || 'Host'}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono mt-0.5 border w-fit px-1 rounded bg-slate-50">
                            Host ID: {listing.hostId}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={listing.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                            {listing.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-slate-900">
                          {formatPrice(listing.pricePerNight)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Booking Status Breakdown */}
        <Card className="lg:col-span-12">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Rental Status Breakdown</CardTitle>
            <p className="text-sm text-muted-foreground">
              Total volume across status lifecycles
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {breakdownStatuses.map((statusKey) => {
              const count = statusCountMap[statusKey] || 0;
              const percentage = totalBookings > 0 ? ((count / totalBookings) * 100).toFixed(1) : '0';
              const meta = STATUS_METADATA[statusKey];

              return (
                <div key={statusKey} className="space-y-1.5 border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 font-medium">
                      {meta?.icon}
                      <span>{meta?.label || statusKey}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{count.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground w-12 text-right">
                        ({percentage}%)
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${meta?.barColor || 'bg-slate-400'}`}
                      style={{ width: `${Math.min(100, parseFloat(percentage))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Attention & Support Metrics (2 cards) */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Open Disputes
            </CardTitle>
            <AlertTriangle
              className={`h-5 w-5 ${openDisputesCount > 0 ? 'text-amber-500' : 'text-slate-400'}`}
            />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div
                className={`text-3xl font-bold ${
                  openDisputesCount > 0 ? 'text-amber-600' : 'text-slate-900'
                }`}
              >
                {openDisputesCount.toLocaleString()}
              </div>
              <Badge
                variant={openDisputesCount > 0 ? 'destructive' : 'outline'}
                className={
                  openDisputesCount === 0
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : ''
                }
              >
                {openDisputesCount > 0 ? 'Action Required' : 'All Clear'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Unresolved booking disputes requiring administrator mediation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Open Support Tickets
            </CardTitle>
            <LifeBuoy
              className={`h-5 w-5 ${openTicketsCount > 0 ? 'text-blue-500' : 'text-slate-400'}`}
            />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div
                className={`text-3xl font-bold ${
                  openTicketsCount > 0 ? 'text-blue-600' : 'text-slate-900'
                }`}
              >
                {openTicketsCount.toLocaleString()}
              </div>
              <Badge
                variant={openTicketsCount > 0 ? 'secondary' : 'outline'}
                className={
                  openTicketsCount === 0
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }
              >
                {openTicketsCount > 0 ? 'In Queue' : 'No Open Tickets'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Customer support inquiries currently pending review or assignment
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
