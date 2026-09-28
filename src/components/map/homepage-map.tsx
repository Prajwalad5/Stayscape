"use client";

import { Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

export function HomepageMap({ properties }: { properties: any[] }) {
  const router = useRouter();
  
  // Center map approximately in Nepal or based on first property
  const defaultCenter = properties.length > 0 
    ? { lat: properties[0].latitude, lng: properties[0].longitude }
    : { lat: 28.3949, lng: 84.1240 };

  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden shadow-sm border relative">
      <Map
        defaultCenter={defaultCenter}
        defaultZoom={7}
        mapId="homepage_map_id"
        disableDefaultUI={false}
        gestureHandling="greedy"
      >
        {properties.map(prop => (
          <AdvancedMarker
            key={prop.id}
            position={{ lat: prop.latitude, lng: prop.longitude }}
            onClick={() => router.push(`/properties/${prop.id}`)}
          >
            <div className="group relative">
              <div className="px-3 py-1.5 rounded-full font-bold text-sm shadow-md transition-all duration-200 cursor-pointer bg-white text-black hover:scale-110 hover:bg-black hover:text-white border border-slate-200">
                {formatCurrency(prop.pricePerMonth || prop.pricePerNight, 'NPR')}
              </div>
              
              {/* Tooltip Card */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                <Card className="overflow-hidden shadow-xl border-slate-200">
                  {prop.images?.[0] && (
                    <div className="h-24 w-full bg-slate-100 relative">
                      <img src={prop.images[0].url} alt={prop.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardContent className="p-3 text-left">
                    <p className="font-semibold text-sm line-clamp-1">{prop.title}</p>
                    <p className="text-xs text-muted-foreground">{prop.city}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </AdvancedMarker>
        ))}
      </Map>
    </div>
  );
}
