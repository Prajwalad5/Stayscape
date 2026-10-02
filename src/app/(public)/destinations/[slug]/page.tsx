export const dynamic = 'force-dynamic';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PropertyCard } from '@/components/property/property-card';
import { EmptyState } from '@/components/shared/empty-state';
import { SearchMap } from '@/components/map/search-map';
import { GlobalSearch } from '@/components/search/global-search';
import type { Metadata } from 'next';
import { MapPin } from 'lucide-react';

interface DestinationPageProps {
  params: { slug: string };
}

// Function to convert a slug like "paris-france" back to a query string
function parseSlug(slug: string): string {
  // Replace dashes with spaces, simple approximation
  return slug.split('-').join(' ');
}

export async function generateMetadata({ params }: DestinationPageProps): Promise<Metadata> {
  const locationName = parseSlug(params.slug);
  return {
    title: `Stays in ${locationName} - StayScape`,
    description: `Discover and book the best vacation rentals and properties in ${locationName}.`,
  };
}

async function getDestinationProperties(locationQuery: string) {
  const where: any = {
    status: 'PUBLISHED',
    deletedAt: null,
    OR: [
      { city: { contains: locationQuery, mode: 'insensitive' } },
      { country: { contains: locationQuery, mode: 'insensitive' } },
      { state: { contains: locationQuery, mode: 'insensitive' } },
    ],
  };

  try {
    const properties = await prisma.property.findMany({
      where,
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        host: { select: { id: true, name: true, image: true } },
      },
      orderBy: { averageRating: 'desc' },
      take: 20,
    });
    return properties;
  } catch (error) {
    console.error('Error fetching destination properties:', error);
    return [];
  }
}

export default async function DestinationPage({ params }: DestinationPageProps) {
  const locationName = parseSlug(params.slug);
  const properties = await getDestinationProperties(locationName);
  
  const mapCenter = properties.length > 0 
    ? { lat: properties[0].latitude, lng: properties[0].longitude }
    : undefined;

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-muted py-12 px-4 border-b">
        <div className="container mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 capitalize text-center">
            {locationName}
          </h1>
          <p className="text-muted-foreground text-lg text-center max-w-2xl mx-auto mb-8">
            Find the perfect place to stay in {locationName}. From cozy apartments to luxury villas.
          </p>
          <div className="max-w-xl mx-auto">
             <GlobalSearch initialValue={locationName} />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row container mx-auto">
        {/* Listings Half */}
        <div className="w-full md:w-[60%] lg:w-[50%] p-4 lg:p-6 overflow-y-auto">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-1">
                Places to stay
              </h2>
              <p className="text-muted-foreground text-sm">
                {properties.length} {properties.length === 1 ? 'home' : 'homes'} available
              </p>
            </div>
          </div>

          {properties.length === 0 ? (
            <EmptyState
              icon={MapPin}
              title={`No properties found in ${locationName}`}
              description="We're expanding fast, but don't have any listings here yet. Try searching a nearby major city."
              actionLabel="Search everywhere"
              actionHref="/search"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-12">
              {properties.map((property) => (
                <div key={property.id} id={`property-${property.id}`}>
                  <PropertyCard 
                    property={property as any} 
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map Half */}
        <div className="hidden md:block md:w-[40%] lg:w-[50%] sticky top-[64px] h-[calc(100vh-64px)] bg-muted border-l">
          <SearchMap properties={properties} center={mapCenter} />
        </div>
      </div>
    </div>
  );
}
