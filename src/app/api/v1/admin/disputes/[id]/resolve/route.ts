import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

const resolveSchema = z.object({
  resolution: z.string().min(5),
  refundAmount: z.number().positive().optional()
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

    const body = await request.json();
    const validated = resolveSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: validated.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const dispute = await prisma.dispute.findUnique({
      where: { id: params.id },
      include: { booking: { include: { payment: true } } }
    });
    if (!dispute) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Dispute not found' } }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx: any) => {
      const updated = await tx.dispute.update({
        where: { id: params.id },
        data: {
          status: 'RESOLVED',
          resolution: validated.data.resolution,
          resolvedAt: new Date()
        }
      });

      if (validated.data.refundAmount && dispute.booking?.payment) {
        await tx.refund.create({
          data: {
            paymentId: dispute.booking.payment.id,
            amount: validated.data.refundAmount,
            reason: validated.data.resolution,
            status: 'COMPLETED'
          }
        });
      }

      await tx.adminAction.create({
        data: {
          adminId,
          action: 'RESOLVE_DISPUTE',
          entityType: 'DISPUTE',
          entityId: params.id,
          details: JSON.stringify({ resolution: validated.data.resolution, refundAmount: validated.data.refundAmount })
        }
      });

      await tx.auditLog.create({
        data: {
          userId: adminId,
          action: 'RESOLVE',
          entity: 'DISPUTE',
          entityId: params.id,
          metadata: JSON.stringify({ resolution: validated.data.resolution })
        }
      });

      return updated;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('AdminDisputeResolvePOST error:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } }, { status: 500 });
  }
}