import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET /api/properties/:id
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const property = await prisma.property.findUnique({
      where: { id: params.id, deletedAt: null },
      include: {
        host: { select: { id: true, name: true, image: true, bio: true, createdAt: true } },
        images: { orderBy: { sortOrder: 'asc' } },
        amenities: { include: { amenity: true } },
        reviews: {
          where: { isPublished: true },
          include: { author: { select: { id: true, name: true, image: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        _count: { select: { reviews: true, bookings: true, favorites: true } },
      },
    });

    if (!property) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Property not found' } },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.property.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true, data: property });
  } catch (error) {
    console.error('Property GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch property' } },
      { status: 500 }
    );
  }
}

// PATCH /api/properties/:id
export async function PATCH(
  request: Request,
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
    const property = await prisma.property.findUnique({ where: { id: params.id } });

    if (!property) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Property not found' } },
        { status: 404 }
      );
    }

    if (property.hostId !== userId && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Not authorized to edit this property' } },
        { status: 403 }
      );
    }

    let body;

    try {

      body = await request.json();

    } catch (e) {

      return NextResponse.json({ success: false, error: { code: 'INVALID_JSON', message: 'Malformed JSON body' } }, { status: 400 });

    }
    const updated = await prisma.property.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Property PATCH error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update property' } },
      { status: 500 }
    );
  }
}

// DELETE /api/properties/:id (soft delete)
export async function DELETE(
  request: Request,
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
    const property = await prisma.property.findUnique({ where: { id: params.id } });

    if (!property) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Property not found' } },
        { status: 404 }
      );
    }

    if (property.hostId !== userId && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Not authorized' } },
        { status: 403 }
      );
    }

    await prisma.property.update({
      where: { id: params.id },
      data: { deletedAt: new Date(), status: 'UNPUBLISHED' },
    });

    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error) {
    console.error('Property DELETE error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete property' } },
      { status: 500 }
    );
  }
}
