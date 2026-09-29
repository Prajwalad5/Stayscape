export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

const eventSchema = z.object({
  eventType: z.string(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user ? (session.user as any).id : null;

    let body;

    try {

      body = await request.json();

    } catch (e) {

      return NextResponse.json({ success: false, error: { code: 'INVALID_JSON', message: 'Malformed JSON body' } }, { status: 400 });

    }
    const validated = eventSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: validated.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const event = await prisma.analyticsEvent.create({
      data: {
        eventType: validated.data.eventType,
        entityType: validated.data.entityType,
        entityId: validated.data.entityId,
        metadata: validated.data.metadata ? JSON.stringify(validated.data.metadata) : undefined,
        userId
      }
    });

    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    console.error('AnalyticsEventPOST error:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } }, { status: 500 });
  }
}
