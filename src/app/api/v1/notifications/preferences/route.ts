import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const preferences = await prisma.notificationPreference.findMany({
      where: { userId }
    });

    return NextResponse.json({ success: true, data: preferences });
  } catch (error) {
    console.error('NotificationPreferencesGET error:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } }, { status: 500 });
  }
}

const updateSchema = z.array(z.object({
  eventType: z.string(),
  enabled: z.boolean(),
  frequency: z.string().optional()
}));

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const body = await request.json();
    const validated = updateSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: validated.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const results = await prisma.$transaction(
      validated.data.map(pref => 
        prisma.notificationPreference.upsert({
          where: { userId_eventType: { userId, eventType: pref.eventType } },
          update: { enabled: pref.enabled, frequency: pref.frequency },
          create: { userId, eventType: pref.eventType, enabled: pref.enabled, frequency: pref.frequency }
        })
      )
    );

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error('NotificationPreferencesPUT error:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } }, { status: 500 });
  }
}