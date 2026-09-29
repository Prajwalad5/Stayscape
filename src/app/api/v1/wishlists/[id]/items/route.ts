export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(
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
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ success: false, error: { code: 'INVALID_JSON', message: 'Malformed JSON body' } }, { status: 400 });
    }
    const { listingId } = body;

    if (!listingId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'ListingId is required' } },
        { status: 400 }
      );
    }

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

    const existing = await prisma.wishlistItem.findFirst({
      where: {
        wishlistId: params.id,
        listingId
      }
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: { code: 'DUPLICATE', message: 'Listing already in wishlist' } },
        { status: 400 }
      );
    }

    const item = await prisma.wishlistItem.create({
      data: {
        wishlistId: params.id,
        listingId
      }
    });

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('WishlistItemPOST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
