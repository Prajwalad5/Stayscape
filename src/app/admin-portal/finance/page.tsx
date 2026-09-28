import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { hasPermission, PERMISSIONS } from '@/lib/auth/permissions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export const metadata = { title: 'Finance & Payments | Admin' };

export default async function AdminFinancePage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q || '';

  const session = await auth();
  if (!session || !hasPermission(session.user, PERMISSIONS.USERS_VIEW)) { // Ideally FINANCE_VIEW
    redirect('/admin-portal/dashboard?error=unauthorized');
  }

  const payments = await prisma.payment.findMany({
    where: q ? {
      OR: [
        { id: { contains: q } },
        { providerPaymentId: { contains: q } },
        { receiptNumber: { contains: q } },
        { booking: { property: { title: { contains: q } } } },
      ]
    } : undefined,
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { booking: { include: { property: true } } }
  });

  const totalRevenue = await prisma.payment.aggregate({
    where: { status: 'SUCCEEDED' },
    _sum: { platformFeeAmount: true, amount: true }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">Finance & Payments Ledger</h1>
        <form className="flex gap-2">
          <input 
            type="text" 
            name="q" 
            defaultValue={q} 
            placeholder="Search payments, receipts, properties..." 
            className="px-3 py-2 border rounded-md text-sm w-64" 
          />
          <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium">Search</button>
        </form>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Total Volume</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{formatPrice(totalRevenue._sum.amount || 0)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Platform Revenue</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-green-600">{formatPrice(totalRevenue._sum.platformFeeAmount || 0)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Pending Cash Verification</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-orange-500">{payments.filter(p => p.paymentMethod === 'CASH_AT_OFFICE' && p.status === 'CREATED').length}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{p.id.slice(0, 8)}</TableCell>
                  <TableCell>{p.paymentMethod || p.provider}</TableCell>
                  <TableCell>{p.booking?.property?.title || 'Unknown'}</TableCell>
                  <TableCell className="font-semibold">{formatPrice(p.amount)}</TableCell>
                  <TableCell>{formatPrice(p.platformFeeAmount)}</TableCell>
                  <TableCell><Badge variant="outline">{p.status}</Badge></TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{p.receiptNumber || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

