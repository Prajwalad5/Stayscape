export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const notification = await prisma.notification.findUnique({
      where: { id: params.id }
    });

    if (!notification) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Notification not found' } }, { status: 404 });
    }

    if (notification.userId !== userId) {
      return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } }, { status: 403 });
    }

    const updated = await prisma.notification.update({
      where: { id: params.id },
      data: { isRead: true }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('NotificationReadPOST error:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } }, { status: 500 });
  }
}