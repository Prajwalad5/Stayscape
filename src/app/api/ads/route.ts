export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const placement = searchParams.get('placement') || 'HOMEPAGE_BANNER';

    // Find the highest priority active ad for this placement
    const ad = await prisma.advertisement.findFirst({
      where: {
        placement,
        status: 'ACTIVE',
        OR: [
          { startDate: null },
          { startDate: { lte: new Date() } }
        ],
        AND: [
          { OR: [{ endDate: null }, { endDate: { gte: new Date() } }] }
        ]
      },
      orderBy: { priority: 'desc' }
    });

    if (ad) {
      // Async update impression without blocking
      prisma.advertisement.update({
        where: { id: ad.id },
        data: { impressions: { increment: 1 } }
      }).catch(console.error);

      return NextResponse.json({ success: true, ad });
    }

    return NextResponse.json({ success: true, ad: null });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch ad' }, { status: 500 });
  }
}
