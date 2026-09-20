import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const hostId = (session.user as any).id;
    const role = (session.user as any).role;
    
    if (role !== 'HOST' && role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = { hostId };
    if (status) {
      where.status = status;
    }

    const earnings = await prisma.hostEarning.findMany({
      where,
      include: {
        booking: {
          include: {
            property: { select: { title: true } },
            guest: { select: { name: true, image: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate summaries
    const totals = await prisma.hostEarning.groupBy({
      by: ['status'],
      where: { hostId },
      _sum: { netEarnings: true }
    });

    const summary = {
      pending: totals.find(t => t.status === 'PENDING')?._sum.netEarnings || 0,
      available: totals.find(t => t.status === 'AVAILABLE')?._sum.netEarnings || 0,
      paid: totals.find(t => t.status === 'PAID')?._sum.netEarnings || 0,
    };

    return NextResponse.json({ 
      success: true, 
      data: { earnings, summary } 
    });

  } catch (error) {
    console.error('Fetch earnings error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
