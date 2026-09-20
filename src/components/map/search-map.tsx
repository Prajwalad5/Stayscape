'use client';

import { Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/utils';

interface SearchMapProps {
  properties: any[];
  center?: { lat: number; lng: number };
  hoveredPropertyId?: string | null;
}

export function SearchMap({ properties, center, hoveredPropertyId }: SearchMapProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const map = useMap();
  const [mapCenter, setMapCenter] = useState(center || { lat: 20, lng: 0 });
  const [mapZoom, setMapZoom] = useState(center ? 12 : 2);

  // When center prop changes (e.g. user searches new destination), pan map
  useEffect(() => {
    if (center && map) {
      map.panTo(center);
      map.setZoom(12);
    }
  }, [center, map]);

  const handleBoundsChanged = useCallback(() => {
    if (!map) return;
    const bounds = map.getBounds();
    if (bounds) {
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      
      const params = new URLSearchParams(searchParams.toString());
      params.set('north', ne.lat().toString());
      params.set('south', sw.lat().toString());
      params.set('east', ne.lng().toString());
      params.set('west', sw.lng().toString());
      
      // We don't want to replace the URL on every tiny drag, but maybe push on idle
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [map, searchParams, router]);

  return (
    <div className="w-full h-full min-h-[500px] relative rounded-lg overflow-hidden">
      <Map
        defaultCenter={mapCenter}
        defaultZoom={mapZoom}
        mapId="SEARCH_MAP_ID"
        onIdle={handleBoundsChanged}
        disableDefaultUI={true}
        zoomControl={true}
      >
        {properties.map((prop) => {
          const isHovered = prop.id === hoveredPropertyId;
          return (
            <AdvancedMarker
              key={prop.id}
              position={{ lat: prop.latitude, lng: prop.longitude }}
              onClick={() => {
                const el = document.getElementById(`property-${prop.id}`);
                el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="z-10"
              zIndex={isHovered ? 50 : 1}
            >
              <div className={`px-3 py-1.5 rounded-full font-bold text-sm shadow-md transition-all duration-200 cursor-pointer ${
                isHovered 
                  ? 'bg-primary text-primary-foreground scale-110' 
                  : 'bg-background text-foreground hover:scale-110 border border-border'
              }`}>
                {formatCurrency(prop.pricePerNight / 100, prop.currency || 'USD')}
              </div>
            </AdvancedMarker>
          );
        })}
      </Map>
    </div>
  );
}
