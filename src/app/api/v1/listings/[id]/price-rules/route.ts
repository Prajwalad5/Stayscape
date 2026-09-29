export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

const createPriceRuleSchema = z.object({
  priceType: z.string().min(1),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  price: z.number().int().min(0),
});

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

    const rules = await prisma.priceRule.findMany({
      where: { listingId: params.id },
      orderBy: { startDate: 'asc' }
    });

    return NextResponse.json({ success: true, data: rules });
  } catch (error) {
    console.error('Listing Price Rules GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}

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
    const validated = createPriceRuleSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: validated.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const data = validated.data;

    const rule = await prisma.priceRule.create({
      data: {
        listingId: params.id,
        priceType: data.priceType,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        price: data.price
      }
    });

    return NextResponse.json({ success: true, data: rule });
  } catch (error) {
    console.error('Listing Price Rules POST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
