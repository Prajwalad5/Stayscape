import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Home, Edit, Eye, Star, MapPin } from 'lucide-react';
import { HostPublishButton } from './host-publish-button';
import { HostDeleteListingButton } from './delete-button';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'My Listings' };

export default async function HostListingsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const properties = await prisma.property.findMany({
    where: { hostId: (session.user as any).id, deletedAt: null },
    include: {
      images: { where: { isCover: true }, take: 1 },
      _count: { select: { bookings: true, reviews: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const statusColors: Record<string, string> = {
    PUBLISHED: 'bg-green-100 text-green-800',
    DRAFT: 'bg-gray-100 text-gray-800',
    PENDING_REVIEW: 'bg-yellow-100 text-yellow-800',
    UNPUBLISHED: 'bg-orange-100 text-orange-800',
    SUSPENDED: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Listings</h1>
          <p className="text-muted-foreground">{properties.length} properties</p>
        </div>
        <Link href="/host/listings/new">
          <Button><Plus className="mr-2 h-4 w-4" /> New Listing</Button>
        </Link>
      </div>

      {properties.length > 0 ? (
        <div className="grid gap-4">
          {properties.map((property) => (
            <Card key={property.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {property.images[0] ? (
                    <Image src={property.images[0].url} alt={property.title} fill className="object-cover" sizes="112px" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Home className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{property.title}</h3>
                    <Badge className={statusColors[property.status] || ''} variant="outline">
                      {property.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {property.city}, {property.country}
                    </p>
                    <div className="font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                      Prop ID: {property.id}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span>{formatPrice(property.pricePerNight)} / night</span>
                    <span>{property._count.bookings} bookings</span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3" /> {property.averageRating?.toFixed(1) || 'N/A'}
                      ({property._count.reviews})
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {property.status === 'DRAFT' && (
                    <HostPublishButton propertyId={property.id} />
                  )}
                  <Link href={`/properties/${property.id}`}>
                    <Button variant="outline" size="icon"><Eye className="h-4 w-4" /></Button>
                  </Link>
                  <Link href={`/host/listings/${property.id}/edit`}>
                      <Button variant="outline" size="icon"><Edit className="h-4 w-4" /></Button>
                    </Link>
                    <HostDeleteListingButton propertyId={property.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Home}
          title="No listings yet"
          description="Create your first listing and start earning as a host."
          actionLabel="Create listing"
          actionHref="/host/listings/new"
        />
      )}
    </div>
  );
}
