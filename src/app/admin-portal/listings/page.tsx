import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminUnlistButton } from './admin-unlist-button';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'All Listings' };
export const dynamic = 'force-dynamic';

import { hasPermission, PERMISSIONS } from '@/lib/auth/permissions';

export default async function AdminListingsPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q || '';
  const session = await auth();
  if (!session?.user) redirect('/login');
  
  if (!hasPermission(session.user, PERMISSIONS.LISTINGS_VIEW)) {
    redirect('/admin-portal/dashboard?error=unauthorized');
  }

  const listings = await prisma.property.findMany({
    where: q ? {
      OR: [
        { id: { contains: q } },
        { title: { contains: q } },
        { city: { contains: q } },
        { host: { name: { contains: q } } }
      ]
    } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      host: { select: { name: true, email: true, id: true } }
    },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All Listings</h1>
        <p className="text-muted-foreground">Manage and track all properties on the platform.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Properties List</CardTitle>
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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No listings found.
                    </TableCell>
                  </TableRow>
                ) : (
                  listings.map((listing) => (
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
                          Host ID: {listing.host.id}
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
                      <TableCell className="text-right">
                        <AdminUnlistButton propertyId={listing.id} currentStatus={listing.status} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
