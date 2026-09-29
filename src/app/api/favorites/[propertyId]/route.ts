export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// POST /api/favorites/:propertyId - Add to favorites
export async function POST(
  request: Request,
  { params }: { params: { propertyId: string } }
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

    await prisma.favorite.upsert({
      where: {
        userId_propertyId: {
          userId,
          propertyId: params.propertyId,
        },
      },
      update: {},
      create: {
        userId,
        propertyId: params.propertyId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Favorite POST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to add favorite' } },
      { status: 500 }
    );
  }
}

// DELETE /api/favorites/:propertyId - Remove from favorites
export async function DELETE(
  request: Request,
  { params }: { params: { propertyId: string } }
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

    await prisma.favorite.deleteMany({
      where: {
        userId,
        propertyId: params.propertyId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Favorite DELETE error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to remove favorite' } },
      { status: 500 }
    );
  }
}
