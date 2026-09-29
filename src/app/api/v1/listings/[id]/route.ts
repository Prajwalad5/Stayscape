export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

const updateListingSchema = z.object({
  title: z.string().min(5).optional(),
  description: z.string().min(20).optional(),
  propertyType: z.string().optional(),
  price: z.number().positive().optional(),
  guests: z.number().int().positive().optional(),
  bedrooms: z.number().int().nonnegative().optional(),
  beds: z.number().int().nonnegative().optional(),
  baths: z.number().positive().optional(),
  location: z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listing = await prisma.property.findUnique({
      where: { id: params.id, status: { not: 'ARCHIVED' as any } },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        amenities: true,
        host: { select: { id: true, name: true, image: true, createdAt: true } },
        reviews: {
          where: { status: 'PUBLISHED' },
          include: { author: { select: { id: true, name: true, image: true } } },
          orderBy: { createdAt: 'desc' }
        },
        location: true,
        priceRules: true,
        cancellationPolicies: true
      }
    });

    if (!listing) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Listing not found' } },
        { status: 404 }
      );
    }

    // Increment viewCount asynchronously
    prisma.property.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } }
    }).catch(console.error);

    return NextResponse.json({ success: true, data: listing });
  } catch (error) {
    console.error('Listing GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const property = await prisma.property.findUnique({ where: { id: params.id } });
    if (!property) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Listing not found' } },
        { status: 404 }
      );
    }

    if (property.hostId !== userId && userRole !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }

    let body;

    try {

      body = await request.json();

    } catch (e) {

      return NextResponse.json({ success: false, error: { code: 'INVALID_JSON', message: 'Malformed JSON body' } }, { status: 400 });

    }
    const validated = updateListingSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: validated.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const data = validated.data;
    const updateData: any = { ...data };
    
    if (data.price) {
      updateData.price = data.price * 100;
    }
    
    if (data.location) {
      updateData.location = {
        upsert: {
          create: {
            address: data.location.address || '',
            city: data.location.city || '',
            state: data.location.state || '',
            country: data.location.country || '',
            postalCode: data.location.postalCode || '',
            lat: data.location.lat || 0,
            lng: data.location.lng || 0,
          },
          update: data.location
        }
      };
    }

    const updated = await prisma.property.update({
      where: { id: params.id },
      data: updateData,
      include: { location: true }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Listing PATCH error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const property = await prisma.property.findUnique({ where: { id: params.id } });
    if (!property) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Listing not found' } },
        { status: 404 }
      );
    }

    if (property.hostId !== userId && userRole !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }

    await prisma.property.update({
      where: { id: params.id },
      data: {
        status: 'ARCHIVED' as any,
        deletedAt: new Date()
      }
    });

    return NextResponse.json({ success: true, data: { message: 'Listing deleted successfully' } });
  } catch (error) {
    console.error('Listing DELETE error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}

