'use client';

import { APIProvider } from '@vis.gl/react-google-maps';
import { ReactNode } from 'react';

export function MapProvider({ children }: { children: ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  // If no API key, we render children anyway to allow graceful degradation
  // Note: vis.gl will log a warning if API key is empty
  return (
    <APIProvider apiKey={apiKey} libraries={['places', 'marker']}>
      {children}
    </APIProvider>
  );
}
