import { AMENITIES } from '@/lib/constants';
import * as LucideIcons from 'lucide-react';

interface PropertyAmenitiesProps {
  amenities: { id: string; name: string; icon: string | null; category: string | null }[];
}

export function PropertyAmenities({ amenities }: PropertyAmenitiesProps) {
  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold">What this place offers</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {amenities.map((amenity) => {
          const iconName = amenity.icon || 'Check';
          const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Check;

          return (
            <div key={amenity.id} className="flex items-center gap-3 text-sm">
              <IconComponent className="h-5 w-5 text-muted-foreground" />
              <span>{amenity.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
