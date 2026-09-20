import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

const createListingSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  propertyType: z.string(),
  roomType: z.string().default('ENTIRE_PLACE'),
  pricePerNight: z.number().int().positive(),
  cleaningFee: z.number().int().nonnegative().default(0),
  maxGuests: z.number().int().positive(),
  bedrooms: z.number().int().nonnegative(),
  beds: z.number().int().nonnegative(),
  bathrooms: z.number().nonnegative(),
  location: z.object({
    address: z.string(),
    city: z.string(),
    state: z.string().optional(),
    country: z.string(),
    postalCode: z.string().optional(),
    latitude: z.number(),
    longitude: z.number(),
  }),
  amenityIds: z.array(z.string()).optional(),
  images: z.array(z.object({
    url: z.string().url(),
    caption: z.string().optional(),
    isCover: z.boolean().optional(),
  })).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20'), 100);
    const skip = (page - 1) * pageSize;

    const location = searchParams.get('location');
    const north = searchParams.get('north');
    const south = searchParams.get('south');
    const east = searchParams.get('east');
    const west = searchParams.get('west');
    const propertyType = searchParams.get('propertyType');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const amenities = searchParams.getAll('amenities');
    const minRating = searchParams.get('minRating');
    const guests = searchParams.get('guests');

    const where: any = {
      status: 'ACTIVE',
    };

    if (location) {
      where.location = {
        OR: [
          { city: { contains: location, mode: 'insensitive' } },
          { state: { contains: location, mode: 'insensitive' } },
          { country: { contains: location, mode: 'insensitive' } },
        ]
      };
    }

    if (north && south && east && west) {
      where.location = {
        ...where.location,
        lat: { gte: parseFloat(south), lte: parseFloat(north) },
        lng: { gte: parseFloat(west), lte: parseFloat(east) },
      };
    }

    if (propertyType) {
      where.propertyType = propertyType;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseInt(minPrice) * 100;
      if (maxPrice) where.price.lte = parseInt(maxPrice) * 100;
    }

    if (guests) {
      where.guests = { gte: parseInt(guests) };
    }

    if (minRating) {
      where.rating = { gte: parseFloat(minRating) };
    }

    if (amenities.length > 0) {
      where.amenities = {
        some: {
          name: { in: amenities }
        }
      };
    }

    const [listings, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          images: { take: 5, orderBy: { sortOrder: 'asc' } },
          host: { select: { id: true, name: true, image: true } },
          amenities: { include: { amenity: true } },
          location: true,
        },
        orderBy: { averageRating: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.property.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: listings,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
    });
  } catch (error) {
    console.error('Listings GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    if (userRole !== 'HOST' && userRole !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Must be a host or admin to create a listing' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = createListingSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: validated.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const data = validated.data;

    const listing = await prisma.property.create({
      data: {
        title: data.title,
        description: data.description,
        propertyType: data.propertyType,
        roomType: data.roomType,
        pricePerNight: data.pricePerNight,
        cleaningFee: data.cleaningFee,
        maxGuests: data.maxGuests,
        bedrooms: data.bedrooms,
        beds: data.beds,
        bathrooms: data.bathrooms,
        hostId: userId,
        status: 'DRAFT',
        address: data.location.address,
        city: data.location.city,
        state: data.location.state || '',
        country: data.location.country,
        postalCode: data.location.postalCode || '',
        latitude: data.location.latitude,
        longitude: data.location.longitude,
        location: {
          create: data.location
        },
        amenities: data.amenityIds ? {
          create: data.amenityIds.map(id => ({
            amenityId: id
          }))
        } : undefined,
        images: data.images ? {
          create: data.images.map((img, idx) => ({
            url: img.url,
            caption: img.caption,
            isCover: img.isCover || idx === 0,
            sortOrder: idx
          }))
        } : undefined
      },
      include: {
        location: true,
        amenities: { include: { amenity: true } },
        images: true,
      }
    });

    return NextResponse.json({ success: true, data: listing });
  } catch (error) {
    console.error('Listings POST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
