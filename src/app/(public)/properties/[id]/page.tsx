import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { formatPrice, formatDate } from '@/lib/utils';
import { PropertyMap } from '@/components/map/property-map';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BookingCard } from '@/components/booking/booking-card';
import { PropertyGallery } from '@/components/property/property-gallery';
import { PropertyAmenities } from '@/components/property/property-amenities';
import { PropertyReviews } from '@/components/property/property-reviews';
import {
  Star,
  MapPin,
  Users,
  BedDouble,
  Bath,
  Home,
  Shield,
  Calendar,
  Clock,
} from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { CANCELLATION_POLICIES } from '@/lib/constants';
import type { Metadata } from 'next';

interface PropertyPageProps {
  params: { id: string };
}

async function getProperty(id: string) {
  try {
    return await prisma.property.findUnique({
      where: { id, status: 'PUBLISHED', deletedAt: null },
      include: {
        host: { select: { id: true, name: true, image: true, bio: true, createdAt: true, isHost: true } },
        images: { orderBy: { sortOrder: 'asc' } },
        amenities: { include: { amenity: true } },
        reviews: {
          where: { isPublished: true },
          include: { author: { select: { id: true, name: true, image: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { reviews: true, bookings: true } },
      },
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const property = await getProperty(params.id);
  if (!property) return { title: 'Property Not Found' };

  return {
    title: property.title,
    description: property.description.substring(0, 160),
    openGraph: {
      title: property.title,
      description: property.description.substring(0, 160),
      images: property.images[0]?.url ? [property.images[0].url] : [],
    },
  };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const property = await getProperty(params.id);
  if (!property) notFound();

  const session = await auth();
  const cancellationInfo = CANCELLATION_POLICIES.find(p => p.value === property.cancellationPolicy);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Title Section */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold md:text-3xl">{property.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
          {property.averageRating && property.averageRating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-foreground" />
              <span className="font-semibold">{property.averageRating.toFixed(1)}</span>
              <span className="text-muted-foreground">({property.reviewCount} reviews)</span>
            </div>
          )}
          <span className="text-muted-foreground">·</span>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {property.city}, {property.country}
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <PropertyGallery images={property.images} title={property.title} />

      {/* Main Content */}
      <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Left - Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Host Info */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                {property.roomType === 'ENTIRE_PLACE' ? 'Entire' : property.roomType === 'PRIVATE_ROOM' ? 'Private room in' : 'Shared room in'}{' '}
                {property.propertyType.toLowerCase()} hosted by {property.host.name}
              </h2>
              <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                {(property.rentalType === 'MONTHLY' || property.rentalType === 'LONG_TERM') ? (
                  <>
                    {property.totalRooms && <span className="flex items-center gap-1"><Home className="h-4 w-4" /> {property.totalRooms} rooms</span>}
                    <span className="flex items-center gap-1"><BedDouble className="h-4 w-4" /> {property.bedrooms} bedrooms</span>
                    <span className="flex items-center gap-1"><Bath className="h-4 w-4" /> {property.bathrooms} baths</span>
                    {(property.kitchens || 0) > 0 && <span className="flex items-center gap-1"><Home className="h-4 w-4" /> {property.kitchens} kitchens</span>}
                    {(property.livingRooms || 0) > 0 && <span className="flex items-center gap-1"><Home className="h-4 w-4" /> {property.livingRooms} living</span>}
                  </>
                ) : (
                  <>
                    <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {property.maxGuests} guests</span>
                    <span className="flex items-center gap-1"><BedDouble className="h-4 w-4" /> {property.bedrooms} bedrooms</span>
                    <span className="flex items-center gap-1"><BedDouble className="h-4 w-4" /> {property.beds} beds</span>
                    <span className="flex items-center gap-1"><Bath className="h-4 w-4" /> {property.bathrooms} baths</span>
                  </>
                )}
              </div>
            </div>
            <Link href={`/users/${property.host.id}`}>
              <Avatar className="h-14 w-14">
                <AvatarImage src={property.host.image || undefined} />
                <AvatarFallback>{getInitials(property.host.name)}</AvatarFallback>
              </Avatar>
            </Link>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h3 className="mb-3 text-lg font-semibold">About this place</h3>
            <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
              {property.description}
            </p>
          </div>

          <Separator />

          {/* Rental Information */}
          {(property.rentalType === 'MONTHLY' || property.rentalType === 'LONG_TERM' || property.rentalType === 'WEEKLY') && (
            <>
              <div>
                <h3 className="mb-3 text-lg font-semibold">Rental Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Monthly Rent</p>
                    <p className="font-medium">{formatPrice(property.pricePerMonth || 0)}/month</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Security Deposit</p>
                    <p className="font-medium">{formatPrice(property.securityDeposit || 0)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Advance Required</p>
                    <p className="font-medium">
                      {property.advanceRequired 
                        ? (property.advanceType === 'MONTHS' ? `${property.advanceAmount} Month(s)` : formatPrice(property.advanceAmount || 0)) 
                        : 'No'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Minimum Rental Period</p>
                    <p className="font-medium">{property.minNights > 1 ? (property.minNights >= 30 ? Math.round(property.minNights / 30) + ' Months' : property.minNights + ' Nights') : 'None'}</p>
                  </div>
                </div>

                <h4 className="mt-4 mb-2 font-medium">Utilities & Additional Charges</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Electricity</p>
                    <p className="font-medium">
                      {property.electricityBillingType === 'INCLUDED' ? 'Included' : 
                       property.electricityBillingType === 'SEPARATE_METER' ? 'Separate Meter (Paid by Renter)' : 
                       property.electricityCharge ? formatPrice(property.electricityCharge) + '/month' : 'Not Included'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Water</p>
                    <p className="font-medium">
                      {property.waterBillingType === 'INCLUDED' ? 'Included' : 
                       property.waterCharge ? formatPrice(property.waterCharge) + '/month' : 'Not Included'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Internet</p>
                    <p className="font-medium">
                      {property.internetBillingType === 'INCLUDED' ? 'Included' : 
                       property.internetCharge ? formatPrice(property.internetCharge) + '/month' : 'Not Included'}
                    </p>
                  </div>
                  {(property.maintenanceCharge || 0) > 0 && (
                    <div>
                      <p className="text-muted-foreground">Maintenance</p>
                      <p className="font-medium">{formatPrice(property.maintenanceCharge || 0)}/month</p>
                    </div>
                  )}
                  {(property.parkingCharge || 0) > 0 && (
                    <div>
                      <p className="text-muted-foreground">Parking</p>
                      <p className="font-medium">{formatPrice(property.parkingCharge || 0)}/month</p>
                    </div>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Amenities */}
          <PropertyAmenities amenities={property.amenities.map(pa => pa.amenity)} />

          <Separator />

          {/* House Rules */}
          {property.houseRules && (
            <>
              <div>
                <h3 className="mb-3 text-lg font-semibold">House rules</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Check-in: {property.checkInTime || '3:00 PM'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Check-out: {property.checkOutTime || '11:00 AM'}
                  </div>
                  <p className="mt-2">{property.houseRules}</p>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Cancellation Policy */}
          <div>
            <h3 className="mb-3 text-lg font-semibold">Cancellation policy</h3>
            <div className="rounded-lg border p-4">
              <p className="font-medium">{cancellationInfo?.label || property.cancellationPolicy}</p>
              <p className="text-sm text-muted-foreground mt-1">{cancellationInfo?.description}</p>
            </div>
          </div>

          <Separator />

          {/* Location Map */}
          <div>
            <h3 className="mb-3 text-lg font-semibold">Where you'll be</h3>
            <p className="text-muted-foreground mb-4">{property.city}, {property.country}</p>
            <PropertyMap
              lat={property.latitude}
              lng={property.longitude}
              title={property.title}
              approximate={true}
            />
          </div>

          <Separator />

          {/* Reviews */}
          <PropertyReviews
            reviews={property.reviews}
            averageRating={property.averageRating || 0}
            reviewCount={property.reviewCount}
          />
        </div>

        {/* Right - Booking Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <BookingCard
              property={property}
              isAuthenticated={!!session?.user}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
