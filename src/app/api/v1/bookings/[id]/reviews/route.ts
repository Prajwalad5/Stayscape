import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { sanitizeHtml } from '@/lib/security';
import { z } from 'zod';

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  publicReview: z.string(),
  privateFeedback: z.string().optional(),
  ratings: z.object({
    cleanliness: z.number().int().min(1).max(5),
    accuracy: z.number().int().min(1).max(5),
    communication: z.number().int().min(1).max(5),
    location: z.number().int().min(1).max(5),
    checkIn: z.number().int().min(1).max(5),
    value: z.number().int().min(1).max(5),
  }).optional()
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

    let body;

    try {

      body = await request.json();

    } catch (e) {

      return NextResponse.json({ success: false, error: { code: 'INVALID_JSON', message: 'Malformed JSON body' } }, { status: 400 });

    }
    const validated = reviewSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: validated.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }
    
    const { rating, publicReview, privateFeedback, ratings } = validated.data;

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { review: true, property: true }
    });
    
    if (!booking) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Booking not found' } },
        { status: 404 }
      );
    }
    
    if (booking.guestId !== userId) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }
    
    if (booking.bookingStatus !== 'COMPLETED') {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Can only review completed bookings' } },
        { status: 400 }
      );
    }
    
    if (booking.review) {
      return NextResponse.json(
        { success: false, error: { code: 'CONFLICT', message: 'Review already exists' } },
        { status: 409 }
      );
    }

    const review = await prisma.$transaction(async (tx: any) => {
      const r = await tx.review.create({
        data: {
          bookingId: booking.id,
          propertyId: booking.propertyId,
          authorId: userId,
          targetId: booking.property.hostId,
          overallRating: rating,
          comment: publicReview,
          ratings: ratings ? { create: ratings } : undefined
        }
      });
      
      const newReviewCount = booking.property.reviewCount + 1;
      const newAverage = (((booking.property.averageRating || 0) * booking.property.reviewCount) + rating) / newReviewCount;
      
      await tx.property.update({
        where: { id: booking.propertyId },
        data: { reviewCount: newReviewCount, averageRating: newAverage }
      });
      
      await tx.booking.update({
        where: { id: booking.id },
        data: {
          statusHistory: {
            create: { status: booking.bookingStatus, changedById: userId, note: 'Review left' }
          }
        }
      });
      
      return r;
    });

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (error) {
    console.error('Booking Review POST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
