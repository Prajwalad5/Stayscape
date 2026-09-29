export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { propertySchema } from '@/lib/validators/property';

// GET /api/properties - List properties
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const location = searchParams.get('location');
    const north = searchParams.get('north');
    const south = searchParams.get('south');
    const east = searchParams.get('east');
    const west = searchParams.get('west');
    const propertyType = searchParams.get('propertyType');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    const where: any = { status: 'PUBLISHED', deletedAt: null };

    // Bounds based search takes priority over text search
    if (north && south && east && west) {
      where.latitude = { gte: parseFloat(south), lte: parseFloat(north) };
      // Handle the anti-meridian (180th meridian)
      const e = parseFloat(east);
      const w = parseFloat(west);
      if (w > e) {
        where.OR = [
          { longitude: { gte: w, lte: 180 } },
          { longitude: { gte: -180, lte: e } }
        ];
      } else {
        where.longitude = { gte: w, lte: e };
      }
    } else if (location) {
      where.OR = [
        { city: { contains: location, mode: 'insensitive' } },
        { country: { contains: location, mode: 'insensitive' } },
        { state: { contains: location, mode: 'insensitive' } },
      ];
    }

    if (propertyType) where.propertyType = propertyType;
    if (minPrice || maxPrice) {
      where.pricePerNight = {};
      if (minPrice) where.pricePerNight.gte = parseInt(minPrice) * 100;
      if (maxPrice) where.pricePerNight.lte = parseInt(maxPrice) * 100;
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          images: { orderBy: { sortOrder: 'asc' }, take: 5 },
          host: { select: { id: true, name: true, image: true } },
        },
        orderBy: { averageRating: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.property.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: properties,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Properties GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch properties' } },
      { status: 500 }
    );
  }
}

// POST /api/properties - Create property (host only)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    if (role !== 'HOST' && role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Only hosts can create properties' } },
        { status: 403 }
      );
    }

    let body;

    try {

      body = await request.json();

    } catch (e) {

      return NextResponse.json({ success: false, error: { code: 'INVALID_JSON', message: 'Malformed JSON body' } }, { status: 400 });

    }
    const validated = propertySchema.safeParse(body);

    if (!validated.success) {
      console.error('Validation Error Details:', validated.error.flatten().fieldErrors);
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: validated.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const { amenityIds, images, ...propertyData } = validated.data;

    const property = await prisma.property.create({
      data: {
        ...propertyData,
        hostId: userId,
        amenities: amenityIds ? {
          create: amenityIds.map(id => ({ amenityId: id })),
        } : undefined,
        images: images && images.length > 0 ? {
          create: images.map((img, idx) => ({
            url: img.url,
            isCover: idx === 0,
            sortOrder: idx,
          })),
        } : undefined,
      },
      include: {
        images: true,
        amenities: { include: { amenity: true } },
      },
    });

    return NextResponse.json({ success: true, data: property }, { status: 201 });
  } catch (error) {
    console.error('Property create error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create property' } },
      { status: 500 }
    );
  }
}
