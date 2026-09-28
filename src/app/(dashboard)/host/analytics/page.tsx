import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Home, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default async function HostAnalyticsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  
  const userId = (session.user as any).id;

  // Real Database Queries
  const properties = await prisma.property.findMany({
    where: { hostId: userId, deletedAt: null },
    include: {
      bookings: {
        where: { deletedAt: null }
      }
    }
  });

  const totalProperties = properties.length;
  const publishedProperties = properties.filter(p => p.status === 'PUBLISHED').length;
  
  let totalRequests = 0;
  let approvedRentals = 0;
  let totalValue = 0;

  properties.forEach(p => {
    p.bookings.forEach(b => {
      totalRequests++;
      if (['APPROVED', 'PAYMENT_PENDING', 'PAYMENT_SUCCESS', 'CONFIRMED', 'ACTIVE'].includes(b.bookingStatus)) {
        approvedRentals++;
        // Use total price since we're displaying NPR host revenue
        totalValue += (b.totalPrice || 0);
      }
    });
  });

  const conversionRate = totalRequests > 0 ? ((approvedRentals / totalRequests) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">Track your property performance and earnings.</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Home className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProperties}</div>
            <p className="text-xs text-muted-foreground mt-1">{publishedProperties} currently published</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Rental Requests</CardTitle>
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">All time requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">{approvedRentals} approved rentals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue, 'NPR')}</div>
            <p className="text-xs text-muted-foreground mt-1">From approved rentals</p>
          </CardContent>
        </Card>
      </div>

      {totalRequests === 0 && (
        <Card className="mt-8 border-dashed bg-slate-50/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <BarChart3 className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium">No rental activity yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-2">
              Once guests request your properties, detailed analytics and performance charts will appear here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
