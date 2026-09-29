export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const updated = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('NotificationReadAllPOST error:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } }, { status: 500 });
  }
}
