import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { PropertyCard } from '@/components/property/property-card';
import { SearchFilters } from '@/components/search/search-filters';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { Search as SearchIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { SearchMap } from '@/components/map/search-map';

export const metadata: Metadata = {
  title: 'Search Properties',
  description: 'Search and discover unique stays around the world on StayScape',
};

interface SearchPageProps {
  searchParams: {
    location?: string;
    north?: string;
    south?: string;
    east?: string;
    west?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    minPrice?: string;
    maxPrice?: string;
    propertyType?: string;
    roomType?: string;
    bedrooms?: string;
    bathrooms?: string;
    instantBook?: string;
    sort?: string;
    page?: string;
  };
}

async function getProperties(params: SearchPageProps['searchParams']) {
  const page = parseInt(params.page || '1');
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  const where: any = {
    status: 'PUBLISHED',
    deletedAt: null,
  };

  if (params.north && params.south && params.east && params.west) {
    where.latitude = { gte: parseFloat(params.south), lte: parseFloat(params.north) };
    const e = parseFloat(params.east);
    const w = parseFloat(params.west);
    if (w > e) {
      where.OR = [
        { longitude: { gte: w, lte: 180 } },
        { longitude: { gte: -180, lte: e } }
      ];
    } else {
      where.longitude = { gte: w, lte: e };
    }
  } else if (params.location) {
    where.OR = [
      { city: { contains: params.location, mode: 'insensitive' } },
      { country: { contains: params.location, mode: 'insensitive' } },
      { state: { contains: params.location, mode: 'insensitive' } },
      { address: { contains: params.location, mode: 'insensitive' } },
    ];
  }

  if (params.guests) where.maxGuests = { gte: parseInt(params.guests) };
  
  if (params.minPrice || params.maxPrice) {
    where.pricePerNight = {};
    if (params.minPrice) where.pricePerNight.gte = parseInt(params.minPrice) * 100;
    if (params.maxPrice) where.pricePerNight.lte = parseInt(params.maxPrice) * 100;
  }

  if (params.propertyType) where.propertyType = params.propertyType;
  if (params.roomType) where.roomType = params.roomType;
  if (params.bedrooms) where.bedrooms = { gte: parseInt(params.bedrooms) };
  if (params.bathrooms) where.bathrooms = { gte: parseFloat(params.bathrooms) };
  if (params.instantBook === 'true') where.isInstantBook = true;

  let orderBy: any = { averageRating: 'desc' };
  switch (params.sort) {
    case 'price_asc': orderBy = { pricePerNight: 'asc' }; break;
    case 'price_desc': orderBy = { pricePerNight: 'desc' }; break;
    case 'rating': orderBy = { averageRating: 'desc' }; break;
    case 'newest': orderBy = { createdAt: 'desc' }; break;
  }

  try {
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          host: { select: { id: true, name: true, image: true } },
        },
        orderBy,
        skip,
        take: pageSize,
      }),
      prisma.property.count({ where }),
    ]);

    return { properties, total, page, totalPages: Math.ceil(total / pageSize) };
  } catch (error) {
    console.error('Search error:', error);
    return { properties: [], total: 0, page, totalPages: 0 };
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { properties, total } = await getProperties(searchParams);
  
  const mapCenter = properties.length > 0 
    ? { lat: properties[0].latitude, lng: properties[0].longitude }
    : undefined;

  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-16 z-30 bg-background border-b px-4 py-4 flex justify-end items-center shadow-sm">
        <SearchFilters />
      </div>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Listings Half */}
        <div className="w-full md:w-[60%] lg:w-[50%] p-4 lg:p-6 overflow-y-auto">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold tracking-tight mb-1">
                {searchParams.location ? `Stays in ${searchParams.location}` : 'Explore Stays'}
              </h1>
              <p className="text-muted-foreground text-sm">
                {total} {total === 1 ? 'home' : 'homes'} available
              </p>
            </div>
          </div>

          <Suspense fallback={<SearchLoading />}>
            {properties.length === 0 ? (
              <EmptyState
                icon={SearchIcon}
                title="No exact matches found"
                description="Try changing or removing some of your filters or adjusting your search area."
                actionLabel="Clear all filters"
                actionHref="/search"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {properties.map((property) => (
                  <div key={property.id} id={`property-${property.id}`}>
                    <PropertyCard 
                      property={property as any} 
                    />
                  </div>
                ))}
              </div>
            )}
          </Suspense>
        </div>

        {/* Map Half */}
        <div className="hidden md:block md:w-[40%] lg:w-[50%] sticky top-[133px] h-[calc(100vh-133px)] bg-muted border-l">
          <SearchMap properties={properties} center={mapCenter} />
        </div>
      </div>
    </div>
  );
}

function SearchLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-[250px] w-full rounded-xl" />
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      ))}
    </div>
  );
}
