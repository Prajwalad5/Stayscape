export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const input = searchParams.get('input');
    
    if (!input) {
      return NextResponse.json({ success: false, error: 'Input is required' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      // Graceful fallback for development if key is missing
      return NextResponse.json({ success: true, data: [] });
    }

    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=(regions)&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API Error:', data.status, data.error_message);
      return NextResponse.json({ success: false, error: 'Failed to fetch suggestions' }, { status: 500 });
    }

    const suggestions = data.predictions.map((p: any) => ({
      placeId: p.place_id,
      description: p.description,
      mainText: p.structured_formatting?.main_text || p.description,
      secondaryText: p.structured_formatting?.secondary_text || '',
    }));

    return NextResponse.json({ success: true, data: suggestions });
  } catch (error) {
    console.error('Autocomplete API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
