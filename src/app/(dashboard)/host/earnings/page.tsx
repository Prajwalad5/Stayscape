export const dynamic = 'force-dynamic';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Earnings' };

export default async function HostEarningsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const userId = (session.user as any).id;

  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [totalEarnings, thisMonthEarnings, lastMonthEarnings, recentPayments] = await Promise.all([
    prisma.booking.aggregate({
      where: { property: { hostId: userId }, bookingStatus: { in: ['CONFIRMED', 'COMPLETED'] } },
      _sum: { hostPayoutAmount: true },
    }),
    prisma.booking.aggregate({
      where: {
        property: { hostId: userId },
        bookingStatus: { in: ['CONFIRMED', 'COMPLETED'] },
        paidAt: { gte: thisMonth },
      },
      _sum: { hostPayoutAmount: true },
    }),
    prisma.booking.aggregate({
      where: {
        property: { hostId: userId },
        bookingStatus: { in: ['CONFIRMED', 'COMPLETED'] },
        paidAt: { gte: lastMonth, lt: thisMonth },
      },
      _sum: { hostPayoutAmount: true },
    }),
    prisma.booking.findMany({
      where: { property: { hostId: userId }, bookingStatus: { in: ['CONFIRMED', 'COMPLETED'] } },
      include: { property: { select: { title: true } }, guest: { select: { name: true } } },
      orderBy: { paidAt: 'desc' },
      take: 10,
    }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Earnings</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice((totalEarnings._sum?.hostPayoutAmount || 0) || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice((thisMonthEarnings._sum?.hostPayoutAmount || 0) || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Last Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice((lastMonthEarnings._sum?.hostPayoutAmount || 0) || 0)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
        <CardContent>
          {recentPayments.length > 0 ? (
            <div className="space-y-4">
              {recentPayments.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">{booking.property.title}</p>
                    <p className="text-sm text-muted-foreground">Guest: {booking.guest.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {booking.paidAt ? new Date(booking.paidAt).toLocaleDateString() : 'Pending'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600 flex items-center gap-1">
                      <ArrowUpRight className="h-4 w-4" />
                      {formatPrice(booking.hostPayoutAmount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No transactions yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
