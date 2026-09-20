'use client';

import { Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { MapPin } from 'lucide-react';

interface PropertyMapProps {
  lat: number;
  lng: number;
  title?: string;
  approximate?: boolean;
}

export function PropertyMap({ lat, lng, title, approximate = false }: PropertyMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="w-full h-[400px] rounded-xl bg-muted flex flex-col items-center justify-center gap-3 border">
        <MapPin className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground text-center px-4">
          Map is not available right now. The property is located at approximately ({lat.toFixed(2)}, {lng.toFixed(2)}).
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden border relative">
      <Map
        defaultCenter={{ lat, lng }}
        defaultZoom={approximate ? 13 : 15}
        mapId="PROPERTY_DETAIL_MAP"
        disableDefaultUI={true}
        zoomControl={true}
        fullscreenControl={true}
      >
        {approximate ? (
          <AdvancedMarker position={{ lat, lng }}>
            <div className="h-32 w-32 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
          </AdvancedMarker>
        ) : (
          <AdvancedMarker position={{ lat, lng }}>
            <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
              <MapPin className="h-4 w-4 inline mr-1" />
              {title || 'Property'}
            </div>
          </AdvancedMarker>
        )}
      </Map>
      {approximate && (
        <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur px-3 py-1.5 rounded-lg text-xs text-muted-foreground border">
          Approximate location shown
        </div>
      )}
    </div>
  );
}
