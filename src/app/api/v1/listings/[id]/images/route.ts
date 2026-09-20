import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

const addImageSchema = z.object({
  url: z.string().url(),
  caption: z.string().optional(),
  isCover: z.boolean().optional().default(false),
});

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
    const userRole = (session.user as any).role;

    const property = await prisma.property.findUnique({
      where: { id: params.id },
      include: { images: true }
    });

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

    const body = await request.json();
    const validated = addImageSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: validated.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const { url, caption, isCover } = validated.data;
    const nextSortOrder = property.images.length;

    // Use a transaction if isCover is true to unset others
    if (isCover) {
      await prisma.$transaction([
        prisma.propertyImage.updateMany({
          where: { propertyId: params.id },
          data: { isCover: false }
        }),
        prisma.propertyImage.create({
          data: {
            url,
            caption,
            isCover: true,
            sortOrder: nextSortOrder,
            propertyId: params.id
          }
        })
      ]);
    } else {
      await prisma.propertyImage.create({
        data: {
          url,
          caption,
          isCover: false,
          sortOrder: nextSortOrder,
          propertyId: params.id
        }
      });
    }

    const updatedImages = await prisma.propertyImage.findMany({
      where: { propertyId: params.id },
      orderBy: { sortOrder: 'asc' }
    });

    return NextResponse.json({ success: true, data: updatedImages });
  } catch (error) {
    console.error('Listing Add Image error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
