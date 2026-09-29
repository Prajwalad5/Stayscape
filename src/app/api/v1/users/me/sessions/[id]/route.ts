export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function DELETE(
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
    const sessionId = params.id;

    const targetSession = await prisma.session.findUnique({
      where: { id: sessionId }
    });

    if (!targetSession) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Session not found' } },
        { status: 404 }
      );
    }

    // IDOR protection: Verify the session belongs to the authenticated user
    if (targetSession.userId !== userId) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }

    await prisma.session.delete({
      where: { id: sessionId }
    });

    return NextResponse.json({ success: true, data: { message: 'Session revoked successfully' } });
  } catch (error) {
    console.error('SessionDeleteRoute error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
