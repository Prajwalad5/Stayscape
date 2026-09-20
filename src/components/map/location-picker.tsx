'use client';

import { useEffect, useState, useRef } from 'react';
import { Map, AdvancedMarker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin } from 'lucide-react';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';

interface LocationData {
  lat: number;
  lng: number;
  address: string;
  city: string;
  state: string;
  country: string;
  countryCode: string;
  postalCode: string;
  formattedAddress: string;
  googlePlaceId: string;
}

interface LocationPickerProps {
  initialLocation?: LocationData | null;
  onChange: (location: LocationData) => void;
  disabled?: boolean;
}

export function LocationPicker({ initialLocation, onChange, disabled }: LocationPickerProps) {
  const map = useMap();
  const placesLibrary = useMapsLibrary('places');
  const [markerPos, setMarkerPos] = useState({ 
    lat: initialLocation?.lat || 27.7172, 
    lng: initialLocation?.lng || 85.3240 
  });
  
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {},
    debounce: 300,
  });

  const handleSelect = async (address: string) => {
    setValue(address, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      
      setMarkerPos({ lat, lng });
      if (map) {
        map.panTo({ lat, lng });
        map.setZoom(15);
      }
      
      processGeocodeResult(results[0]);
    } catch (error) {
      console.error('Error: ', error);
    }
  };

  const handleMarkerDragEnd = async (e: any) => {
    const lat = e.latLng?.lat();
    const lng = e.latLng?.lng();
    if (lat && lng) {
      setMarkerPos({ lat, lng });
      
      // Reverse geocode
      try {
        const response = await fetch(`/api/locations/geocode?address=${lat},${lng}`);
        const result = await response.json();
        if (result.success && result.data) {
          onChange({
            ...result.data,
            lat,
            lng,
          });
          setValue(result.data.formattedAddress, false);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const processGeocodeResult = (result: google.maps.GeocoderResult) => {
    let country = '';
    let city = '';
    let state = '';
    let countryCode = '';
    let postalCode = '';
    let route = '';
    let streetNumber = '';

    result.address_components.forEach((comp) => {
      const types = comp.types;
      if (types.includes('country')) {
        country = comp.long_name;
        countryCode = comp.short_name;
      }
      if (types.includes('locality') || types.includes('postal_town') || types.includes('administrative_area_level_2')) {
        city = city || comp.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        state = comp.long_name;
      }
      if (types.includes('postal_code')) {
        postalCode = comp.long_name;
      }
      if (types.includes('route')) {
        route = comp.long_name;
      }
      if (types.includes('street_number')) {
        streetNumber = comp.long_name;
      }
    });

    const address = streetNumber ? `${streetNumber} ${route}` : route || city;

    onChange({
      lat: result.geometry.location.lat(),
      lng: result.geometry.location.lng(),
      address,
      city: city || state || country,
      state,
      country,
      countryCode,
      postalCode,
      formattedAddress: result.formatted_address,
      googlePlaceId: result.place_id,
    });
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={!ready || disabled}
          placeholder="Search for an address or place"
          className="pl-9"
        />
        {status === 'OK' && (
          <ul className="absolute z-10 w-full bg-background border rounded-md mt-1 shadow-md max-h-60 overflow-auto">
            {data.map(({ place_id, description }) => (
              <li
                key={place_id}
                className="px-4 py-2 hover:bg-muted cursor-pointer flex items-center gap-2"
                onClick={() => handleSelect(description)}
              >
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate">{description}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="h-[400px] w-full rounded-md border overflow-hidden relative">
        <Map
          defaultCenter={markerPos}
          defaultZoom={13}
          mapId="LOCATION_PICKER_MAP"
          gestureHandling="greedy"
          disableDefaultUI={true}
        >
          <AdvancedMarker 
            position={markerPos} 
            draggable={!disabled}
            onDragEnd={handleMarkerDragEnd}
          />
        </Map>
      </div>
    </div>
  );
}
