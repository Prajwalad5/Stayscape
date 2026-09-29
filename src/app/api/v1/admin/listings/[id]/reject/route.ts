export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

const rejectSchema = z.object({
  reason: z.string().min(5)
});

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

    let body;

    try {

      body = await request.json();

    } catch (e) {

      return NextResponse.json({ success: false, error: { code: 'INVALID_JSON', message: 'Malformed JSON body' } }, { status: 400 });

    }
    const validated = rejectSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: validated.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const listing = await prisma.property.findUnique({ where: { id: params.id } });
    if (!listing) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Listing not found' } }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx: any) => {
      const updated = await tx.property.update({
        where: { id: params.id },
        data: {
          status: 'REJECTED'
        }
      });

      await tx.adminAction.create({
        data: {
          adminId,
          action: 'REJECT_LISTING',
          entityType: 'PROPERTY',
          entityId: params.id,
          details: JSON.stringify({ reason: validated.data.reason })
        }
      });

      await tx.auditLog.create({
        data: {
          userId: adminId,
          action: 'REJECT',
          entity: 'PROPERTY',
          entityId: params.id,
          metadata: JSON.stringify({ reason: validated.data.reason })
        }
      });

      await tx.moderationCase.create({
        data: {
          entityId: params.id,
          entityType: 'PROPERTY',
          status: 'RESOLVED',
          resolution: 'REJECTED',
          moderatorId: adminId,
          notes: validated.data.reason
        }
      });

      return updated;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('AdminListingRejectPOST error:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } }, { status: 500 });
  }
}
