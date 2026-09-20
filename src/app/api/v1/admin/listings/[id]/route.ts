import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
    }
    const adminRole = (session.user as any).adminRole;
    if (!adminRole) {
      return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } }, { status: 403 });
    }

    const listing = await prisma.property.findUnique({
      where: { id: params.id },
      include: {
        host: true,
        images: true,
        amenities: true,
        _count: {
          select: {
            bookings: true,
            reviews: true
          }
        }
      }
    });

    if (!listing) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Listing not found' } }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: listing });
  } catch (error) {
    console.error('AdminListingDetailsGET error:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } }, { status: 500 });
  }
}
