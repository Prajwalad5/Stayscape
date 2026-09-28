import { HomepageMap } from '@/components/map/homepage-map';
import Link from 'next/link';
import { Search, Star, Shield, Heart, MapPin, Users, Calendar, ChevronRight, Home, Building2, TreePine, Castle, Waves, Sparkles, Mountain, Tent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import { PropertyCard } from '@/components/property/property-card';
import { SearchBar } from '@/components/search/search-bar';
import { APIProvider } from '@vis.gl/react-google-maps';
import { formatPrice } from '@/lib/utils';
import { PROPERTY_TYPES, FEATURED_DESTINATIONS } from '@/lib/constants';

const CATEGORIES = [
  { name: 'Houses', icon: Home, value: 'HOUSE' },
  { name: 'Apartments', icon: Building2, value: 'APARTMENT' },
  { name: 'Cabins', icon: TreePine, value: 'CABIN' },
  { name: 'Villas', icon: Castle, value: 'VILLA' },
  { name: 'Beachfront', icon: Waves, value: 'beach' },
  { name: 'Mountain', icon: Mountain, value: 'mountain' },
  { name: 'Unique Stays', icon: Sparkles, value: 'UNIQUE' },
  { name: 'Camping', icon: Tent, value: 'camping' },
];

async function getFeaturedProperties() {
  try {
    return await prisma.property.findMany({
      where: { status: 'PUBLISHED', deletedAt: null },
      include: {
        images: { where: { isCover: true }, take: 1 },
        host: { select: { id: true, name: true, image: true } },
      },
      orderBy: { averageRating: 'desc' },
      take: 8,
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const properties = await getFeaturedProperties();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              Find your next
              <span className="text-primary"> perfect stay</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Discover unique homes, apartments, and experiences around the world.
              Book with confidence on StayScape.
            </p>

            {/* Search Bar */}
            <div className="mx-auto max-w-3xl">
              <SearchBar />
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-4 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Categories */}
      <section className="border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-8 overflow-x-auto py-4 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.value}
                href={`/search?propertyType=${cat.value}`}
                className="flex flex-col items-center gap-1.5 px-2 py-2 text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap group"
              >
                <cat.icon className="h-6 w-6 group-hover:text-primary transition-colors" />
                <span className="text-xs font-medium">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">Popular stays</h2>
              <p className="text-muted-foreground mt-1">Top-rated properties loved by guests</p>
            </div>
            <Link href="/search">
              <Button variant="outline" className="hidden md:flex">
                View all <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {properties.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={{
                    id: property.id,
                    title: property.title,
                    city: property.city,
                    country: property.country,
                    pricePerNight: property.pricePerNight,
                    images: property.images.map(img => ({ url: img.url, isCover: img.isCover })),
                    averageRating: property.averageRating,
                    reviewCount: property.reviewCount,
                    propertyType: property.propertyType,
                    roomType: property.roomType,
                    maxGuests: property.maxGuests,
                    bedrooms: property.bedrooms,
                    beds: property.beds,
                    bathrooms: property.bathrooms,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-square rounded-xl bg-muted animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
                    <div className="h-4 w-1/3 rounded bg-muted animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Link href="/search">
              <Button variant="outline" className="w-full">
                View all properties
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="bg-muted/30 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-2 text-2xl font-bold md:text-3xl">Explore destinations</h2>
          <p className="mb-8 text-muted-foreground">Find stays in popular locations around the world</p>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {FEATURED_DESTINATIONS.slice(0, 8).map((dest) => (
              <Link
                key={dest.name}
                href={`/search?location=${encodeURIComponent(dest.name)}`}
                className="group relative overflow-hidden rounded-xl aspect-[4/3] bg-muted"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
                <div className="absolute inset-0 bg-primary/20" />
                <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
                  <h3 className="font-semibold text-white">{dest.name}</h3>
                  <p className="text-xs text-white/80">{dest.country}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Become a Host CTA */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-8 md:p-16">
            <div className="relative z-10 max-w-xl">
              <h2 className="mb-4 text-3xl font-bold text-primary-foreground md:text-4xl">
                Earn money sharing your space
              </h2>
              <p className="mb-8 text-lg text-primary-foreground/90">
                Join thousands of hosts on StayScape. List your property, set your
                own prices, and start earning from guests around the world.
              </p>
              <Link href="/host/get-started">
                <Button
                  size="lg"
                  variant="secondary"
                  className="font-semibold"
                >
                  Start hosting
                </Button>
              </Link>
            </div>
            {/* Decorative circles */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />
            <div className="absolute -bottom-10 right-20 h-40 w-40 rounded-full bg-white/5" />
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="border-t bg-muted/20 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-2xl font-bold md:text-3xl">
            Travel with confidence
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold">Verified properties</h3>
              <p className="text-sm text-muted-foreground">
                Every listing is reviewed for quality and accuracy before going live.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Star className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold">Trusted reviews</h3>
              <p className="text-sm text-muted-foreground">
                Real reviews from verified guests help you choose the perfect stay.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Heart className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold">24/7 support</h3>
              <p className="text-sm text-muted-foreground">
                Our support team is always available to help with any issues.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
