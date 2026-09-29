export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { publishAdminEvent } from '@/lib/event-emitter';
import { hasPermission, PERMISSIONS } from '@/lib/auth/permissions';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    const user = session?.user as any;
    

    // Require ADMIN and specific permission
    if (!user || (user.role !== 'ADMIN' && !user.adminRole) || !hasPermission(user, PERMISSIONS.LISTINGS_SUSPEND)) {
      return NextResponse.json({ error: 'Unauthorized or Forbidden' }, { status: 403 });
    }

    const propertyId = params.id;
    
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    if (property.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Property is not published' }, { status: 400 });
    }

    const updated = await prisma.property.update({
      where: { id: propertyId },
      data: { status: 'UNPUBLISHED' }
    });

    // Real-time Event
    await publishAdminEvent(
      'PROPERTY_UNLISTED',
      updated.id,
      `Property ${updated.title} was forcibly unlisted by Admin`,
      { propertyId: updated.id, hostId: updated.hostId },
      user.id
    );

    return NextResponse.json({ success: true, property: updated }, { status: 200 });
  } catch (error: any) {
    console.error('[UNLIST_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
