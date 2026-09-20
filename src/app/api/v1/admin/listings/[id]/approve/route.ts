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
    const adminId = (session.user as any).id;
    const adminRole = (session.user as any).adminRole;
    if (!adminRole) {
      return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } }, { status: 403 });
    }

    const listing = await prisma.property.findUnique({ where: { id: params.id } });
    if (!listing) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Listing not found' } }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx: any) => {
      const updated = await tx.property.update({
        where: { id: params.id },
        data: {
          status: 'ACTIVE',
          publishedAt: new Date()
        }
      });

      await tx.adminAction.create({
        data: {
          adminId,
          action: 'APPROVE_LISTING',
          entityType: 'PROPERTY',
          entityId: params.id,
          details: JSON.stringify({})
        }
      });

      await tx.auditLog.create({
        data: {
          userId: adminId,
          action: 'APPROVE',
          entity: 'PROPERTY',
          entityId: params.id,
          metadata: JSON.stringify({})
        }
      });

      await tx.moderationCase.create({
        data: {
          entityId: params.id,
          entityType: 'PROPERTY',
          status: 'RESOLVED',
          resolution: 'APPROVED',
          moderatorId: adminId
        }
      });

      return updated;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('AdminListingApprovePOST error:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } }, { status: 500 });
  }
}
