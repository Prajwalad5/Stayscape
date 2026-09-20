import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PropertyCard } from '@/components/property/property-card';
import { EmptyState } from '@/components/shared/empty-state';
import { Heart } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Saved Properties' };

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const favorites = await prisma.favorite.findMany({
    where: { userId: (session.user as any).id },
    include: {
      property: {
        include: {
          images: { where: { isCover: true }, take: 1 },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Saved Properties</h1>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favorites.map((fav) => (
            <PropertyCard
              key={fav.id}
              property={{
                id: fav.property.id,
                title: fav.property.title,
                city: fav.property.city,
                country: fav.property.country,
                pricePerNight: fav.property.pricePerNight,
                images: fav.property.images.map(img => ({ url: img.url, isCover: img.isCover })),
                averageRating: fav.property.averageRating,
                reviewCount: fav.property.reviewCount,
                propertyType: fav.property.propertyType,
                roomType: fav.property.roomType,
                maxGuests: fav.property.maxGuests,
                bedrooms: fav.property.bedrooms,
                beds: fav.property.beds,
                bathrooms: fav.property.bathrooms,
                isFavorited: true,
              }}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Heart}
          title="No saved properties"
          description="Click the heart icon on any property to save it for later."
          actionLabel="Explore stays"
          actionHref="/search"
        />
      )}
    </div>
  );
}
