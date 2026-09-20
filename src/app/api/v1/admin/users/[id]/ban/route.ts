import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

const banSchema = z.object({
  reason: z.string().min(5).optional()
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

    let reason = 'Banned by admin';
    try {
      const body = await request.json();
      const validated = banSchema.safeParse(body);
      if (validated.success && validated.data.reason) {
        reason = validated.data.reason;
      }
    } catch (e) {
      // Ignored
    }

    const user = await prisma.user.findUnique({ where: { id: params.id } });
    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx: any) => {
      const updated = await tx.user.update({
        where: { id: params.id },
        data: {
          status: 'BANNED'
        }
      });

      await tx.adminAction.create({
        data: {
          adminId,
          action: 'BAN_USER',
          entityType: 'USER',
          entityId: params.id,
          details: JSON.stringify({ reason })
        }
      });

      await tx.auditLog.create({
        data: {
          userId: adminId,
          action: 'BAN',
          entity: 'USER',
          entityId: params.id,
          metadata: JSON.stringify({ reason })
        }
      });

      return updated;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('AdminUserBanPOST error:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } }, { status: 500 });
  }
}
