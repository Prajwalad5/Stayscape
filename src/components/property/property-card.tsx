'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Star, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, formatCurrency } from '@/lib/utils';
import type { PropertyCardData } from '@/types';
import { useCurrentUser } from '@/hooks/use-session';
import { toast } from 'sonner';

interface PropertyCardProps {
  property: PropertyCardData;
  onFavoriteToggle?: (propertyId: string, isFavorited: boolean) => void;
}

export function PropertyCard({ property, onFavoriteToggle }: PropertyCardProps) {
  const { isAuthenticated } = useCurrentUser();
  const [isFavorited, setIsFavorited] = useState(property.isFavorited || false);
  const [imageError, setImageError] = useState(false);

  const coverImage = property.images?.[0]?.url;

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please log in to save properties');
      return;
    }

    const newState = !isFavorited;
    setIsFavorited(newState);

    try {
      const res = await fetch(`/api/favorites/${property.id}`, {
        method: newState ? 'POST' : 'DELETE',
      });
      if (!res.ok) throw new Error();
      onFavoriteToggle?.(property.id, newState);
    } catch {
      setIsFavorited(!newState);
      toast.error('Failed to update favorite');
    }
  };

  return (
    <Link href={`/properties/${property.id}`} className="group block">
      <div className="relative overflow-hidden rounded-xl aspect-square bg-muted">
        {coverImage && !imageError ? (
          <Image
            src={coverImage}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted">
            <MapPin className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-10 h-8 w-8 rounded-full bg-white/80 backdrop-blur hover:bg-white"
          onClick={handleFavorite}
        >
          <Heart
            className={cn(
              'h-4 w-4 transition-colors',
              isFavorited ? 'fill-primary text-primary' : 'text-gray-700'
            )}
          />
        </Button>

        {/* Property Type Badge */}
        <Badge
          variant="secondary"
          className="absolute left-2 top-2 bg-white/90 backdrop-blur text-xs"
        >
          {property.propertyType.charAt(0) + property.propertyType.slice(1).toLowerCase()}
        </Badge>
      </div>

      <div className="mt-3 space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm line-clamp-1">{property.title}</h3>
          {property.averageRating && property.averageRating > 0 && (
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <Star className="h-3.5 w-3.5 fill-foreground" />
              <span className="text-sm font-medium">{property.averageRating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({property.reviewCount})</span>
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {property.city}, {property.country}
        </p>

        <p className="text-sm text-muted-foreground">
          {property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''} · {property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''} · {property.maxGuests} guest{property.maxGuests !== 1 ? 's' : ''}
        </p>

        <p className="text-sm">
          <span className="font-semibold">
            {formatCurrency(
              (property.rentalType === 'MONTHLY' || property.rentalType === 'LONG_TERM') ? ((property.pricePerMonth || 0) / 100) :
              property.rentalType === 'WEEKLY' ? ((property.pricePerWeek || 0) / 100) :
              ((property.pricePerNight || 0) / 100), 
              property.currency || 'NPR'
            )}
          </span>
          <span className="text-muted-foreground">
            {property.rentalType === 'MONTHLY' || property.rentalType === 'LONG_TERM' ? ' / month' :
             property.rentalType === 'WEEKLY' ? ' / week' : ' / night'}
          </span>
        </p>
      </div>
    </Link>
  );
}

