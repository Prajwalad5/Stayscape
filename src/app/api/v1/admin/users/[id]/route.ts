export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

const updateSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED']),
  suspensionReason: z.string().optional()
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
    }
    const adminRole = (session.user as any).adminRole;
    if (!adminRole) {
      return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        profile: true,
        userRoles: { include: { role: true } },
        _count: {
          select: {
            bookings: true,
            properties: true,
            reviewsGiven: true,
            reviewsReceived: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('AdminUserDetailsGET error:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } }, { status: 500 });
  }
}

export async function PATCH(
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
    const validated = updateSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: validated.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const { status, suspensionReason } = validated.data;

    const existingUser = await prisma.user.findUnique({ where: { id: params.id } });
    if (!existingUser) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } }, { status: 404 });
    }

    const updatedUser = await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.update({
        where: { id: params.id },
        data: { 
          status,
          suspensionReason: status === 'SUSPENDED' ? suspensionReason : null
        }
      });

      await tx.adminAction.create({
        data: {
          adminId,
          action: 'UPDATE_USER_STATUS',
          entityType: 'USER',
          entityId: params.id,
          details: JSON.stringify({ oldStatus: existingUser.status, newStatus: status, reason: suspensionReason })
        }
      });

      await tx.auditLog.create({
        data: {
          userId: adminId,
          action: 'UPDATE',
          entity: 'USER',
          entityId: params.id,
          metadata: JSON.stringify({ status })
        }
      });

      return user;
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('AdminUserUpdatePATCH error:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } }, { status: 500 });
  }
}
