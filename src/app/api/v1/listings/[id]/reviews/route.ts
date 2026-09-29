export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20'), 100);
    const skip = (page - 1) * pageSize;

    const property = await prisma.property.findUnique({
      where: { id: params.id }
    });

    if (!property) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Listing not found' } },
        { status: 404 }
      );
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: {
          propertyId: params.id,
          status: 'PUBLISHED'
        },
        include: {
          author: { select: { id: true, name: true, image: true } },
          ratings: true // assuming there is a ReviewRating or similar relation called ratings
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.review.count({
        where: {
          propertyId: params.id,
          status: 'PUBLISHED'
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      data: reviews,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
    });
  } catch (error) {
    console.error('Listing Reviews GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
