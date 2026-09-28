import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

const setAvailabilitySchema = z.array(z.object({
  date: z.string(), // ISO date string
  isAvailable: z.boolean(),
  customPrice: z.number().positive().optional(),
  minNights: z.number().int().positive().optional(),
  maxNights: z.number().int().positive().optional(),
  note: z.string().optional(),
}));

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'startDate and endDate are required' } },
        { status: 400 }
      );
    }

    const availability = await prisma.availability.findMany({
      where: {
        propertyId: params.id,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      orderBy: { date: 'asc' }
    });

    return NextResponse.json({ success: true, data: availability });
  } catch (error) {
    console.error('Listing Availability GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const validated = setAvailabilitySchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: validated.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const updates = validated.data.map(item => {
      const dateObj = new Date(item.date);
      return prisma.availability.upsert({
        where: {
          propertyId_date: {
            propertyId: params.id,
            date: dateObj
          }
        },
        create: {
          propertyId: params.id,
          date: dateObj,
          isAvailable: item.isAvailable,
          customPrice: item.customPrice ? item.customPrice * 100 : undefined,
          minNights: item.minNights,
          maxNights: item.maxNights,
          note: item.note
        },
        update: {
          isAvailable: item.isAvailable,
          customPrice: item.customPrice ? item.customPrice * 100 : undefined,
          minNights: item.minNights,
          maxNights: item.maxNights,
          note: item.note
        }
      });
    });

    await prisma.$transaction(updates);

    return NextResponse.json({ success: true, data: { message: 'Availability updated successfully' } });
  } catch (error) {
    console.error('Listing Availability PUT error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
