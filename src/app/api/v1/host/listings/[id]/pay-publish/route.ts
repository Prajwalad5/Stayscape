export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { publishAdminEvent } from '@/lib/event-emitter';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    const user = session?.user as any;
    
    if (!user || (user.role !== 'HOST' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const propertyId = params.id;
    
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    if (property.hostId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (property.status === 'PUBLISHED') {
      return NextResponse.json({ error: 'Property is already published' }, { status: 400 });
    }

    // Wrap in a transaction to ensure both payment and status update succeed together
    const [updatedProperty, transaction] = await prisma.$transaction([
      prisma.property.update({
        where: { id: propertyId },
        data: { status: 'PUBLISHED' }
      }),
      prisma.transaction.create({
        data: {
          type: 'LISTING_FEE',
          amount: 4900, // $49.00 in cents
          currency: 'usd',
          status: 'COMPLETED',
          description: `Listing commission fee for ${property.title}`
        }
      })
    ]);

    // Emit Real-Time Revenue Event for Admin Dashboard
    await publishAdminEvent(
      'REVENUE_EARNED',
      transaction.id,
      `Received $49.00 listing fee from Host ${user.name || user.id}`,
      { propertyId: updatedProperty.id, amount: 4900, type: 'LISTING_FEE' },
      user.id
    );

    return NextResponse.json({ success: true, property: updatedProperty, transaction }, { status: 200 });
  } catch (error: any) {
    console.error('[PAY_PUBLISH_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
