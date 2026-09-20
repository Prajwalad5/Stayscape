import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get('placeId');
    const address = searchParams.get('address');
    
    if (!placeId && !address) {
      return NextResponse.json({ success: false, error: 'placeId or address is required' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      // Graceful fallback for development if key is missing
      if (address?.toLowerCase().includes('kathmandu')) {
        return NextResponse.json({ success: true, data: { lat: 27.7172, lng: 85.3240, formattedAddress: 'Kathmandu, Nepal', country: 'Nepal' } });
      }
      return NextResponse.json({ success: false, error: 'Google Maps API key missing' }, { status: 503 });
    }

    let url = 'https://maps.googleapis.com/maps/api/geocode/json?key=' + apiKey;
    if (placeId) url += `&place_id=${placeId}`;
    else if (address) url += `&address=${encodeURIComponent(address)}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || data.results.length === 0) {
      return NextResponse.json({ success: false, error: 'Location not found' }, { status: 404 });
    }

    const result = data.results[0];
    const { lat, lng } = result.geometry.location;
    const formattedAddress = result.formatted_address;
    
    let country = '';
    let city = '';
    let state = '';
    let countryCode = '';
    let postalCode = '';

    result.address_components.forEach((comp: any) => {
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
    });

    return NextResponse.json({ 
      success: true, 
      data: {
        lat,
        lng,
        formattedAddress,
        country,
        countryCode,
        city: city || state || country,
        state,
        postalCode,
        placeId: result.place_id,
        bounds: result.geometry.viewport
      } 
    });
  } catch (error) {
    console.error('Geocode API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
