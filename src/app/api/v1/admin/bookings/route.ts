import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
    }
    const adminRole = (session.user as any).adminRole;
    if (!adminRole) {
      return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20'), 100);
    const status = searchParams.get('status');

    const skip = (page - 1) * pageSize;
    
    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: whereClause,
        include: {
          guest: { select: { id: true, name: true, email: true } },
          property: { select: { id: true, title: true } },
          payment: true
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.booking.count({ where: whereClause })
    ]);

    return NextResponse.json({
      success: true,
      data: bookings,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error('AdminBookingsGET error:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } }, { status: 500 });
  }
}
