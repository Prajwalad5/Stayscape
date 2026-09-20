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
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }
    const userId = (session.user as any).id;

    const wishlist = await prisma.wishlist.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            listing: {
              select: {
                id: true, title: true, city: true, pricePerNight: true, averageRating: true, images: true
              }
            }
          }
        }
      }
    });

    if (!wishlist) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Wishlist not found' } },
        { status: 404 }
      );
    }

    if (wishlist.userId !== userId) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: wishlist });
  } catch (error) {
    console.error('WishlistGET error:', error);
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
    const body = await request.json();
    const { name } = body;

    const wishlist = await prisma.wishlist.findUnique({
      where: { id: params.id }
    });

    if (!wishlist) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Wishlist not found' } },
        { status: 404 }
      );
    }

    if (wishlist.userId !== userId) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }

    const updated = await prisma.wishlist.update({
      where: { id: params.id },
      data: { name }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('WishlistPATCH error:', error);
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

    const wishlist = await prisma.wishlist.findUnique({
      where: { id: params.id }
    });

    if (!wishlist) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Wishlist not found' } },
        { status: 404 }
      );
    }

    if (wishlist.userId !== userId) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }

    await prisma.wishlist.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true, data: { success: true } });
  } catch (error) {
    console.error('WishlistDELETE error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
