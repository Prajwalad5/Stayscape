import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }
    
    const userId = (session.user as any).id;

    const sessions = await prisma.session.findMany({
      where: { userId },
      select: {
        id: true,
        device: true,
        ipAddress: true,
        userAgent: true,
        expires: true,
        sessionToken: true
      },
      orderBy: {
        expires: 'desc'
      }
    });

    return NextResponse.json({ success: true, data: sessions });
  } catch (error) {
    console.error('SessionsRoute error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
