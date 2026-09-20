import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string, listingId: string } }
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

    await prisma.wishlistItem.deleteMany({
      where: {
        wishlistId: params.id,
        listingId: params.listingId
      }
    });

    return NextResponse.json({ success: true, data: { success: true } });
  } catch (error) {
    console.error('WishlistItemDELETE error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
