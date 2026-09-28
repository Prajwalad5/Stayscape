import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { publishAdminEvent } from '@/lib/event-emitter';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    const sessionUser = session?.user as any;

    if (!sessionUser || (sessionUser.role !== 'ADMIN' && !sessionUser.adminRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch fresh adminRole from DB
    const freshUser = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { id: true, adminRole: true },
    });

    if (!freshUser || freshUser.adminRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Only Super Admins can manage employees.' }, { status: 403 });
    }
    const user = freshUser;

    const targetId = params.id;
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ success: false, error: { code: 'INVALID_JSON', message: 'Malformed JSON body' } }, { status: 400 });
    }
    
    // Validate target exists
    const target = await prisma.user.findUnique({ where: { id: targetId } });
    if (!target) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
    
    if (target.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Target is not a management employee' }, { status: 400 });
    }

    // Protection against modifying the only SUPER_ADMIN or self-lockout
    if (target.id === user.id && body.status === 'SUSPENDED') {
      return NextResponse.json({ error: 'You cannot suspend your own account' }, { status: 400 });
    }

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.department !== undefined) updateData.department = body.department;
    if (body.adminRole !== undefined) updateData.adminRole = body.adminRole;
    if (body.status !== undefined) {
      updateData.status = body.status;
      if (body.status === 'SUSPENDED') {
        updateData.suspendedAt = new Date();
        updateData.suspensionReason = body.suspensionReason || 'Admin action';
      } else if (body.status === 'ACTIVE') {
        updateData.suspendedAt = null;
        updateData.suspensionReason = null;
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const emp = await tx.user.update({
        where: { id: targetId },
        data: updateData,
      });

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'EMPLOYEE_UPDATED',
          entity: 'USER',
          entityId: emp.id,
          details: JSON.stringify(updateData),
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        }
      });

      return emp;
    });

    await publishAdminEvent(
      'EMPLOYEE_UPDATED',
      updated.id,
      `Employee updated: ${updated.name}`,
      { employeeId: updated.id, updates: Object.keys(updateData) },
      user.id
    );

    const { passwordHash, ...safeData } = updated;
    return NextResponse.json({ success: true, data: safeData });
  } catch (error) {
    console.error('Employee PATCH error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
