import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';
import { publishAdminEvent } from '@/lib/event-emitter';

import crypto from 'crypto';

// Generate random secure password
function generateSecurePassword() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  const randomBytes = crypto.randomBytes(16);
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars[randomBytes[i] % chars.length];
  }
  return password;
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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
      return NextResponse.json({ error: 'Forbidden. Only Super Admins can reset credentials.' }, { status: 403 });
    }
    const user = freshUser;

    const targetId = params.id;
    
    const target = await prisma.user.findUnique({ where: { id: targetId } });
    if (!target || target.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Management employee not found' }, { status: 404 });
    }

    // Generate new password
    const plainTextPassword = generateSecurePassword();
    const passwordHash = await bcrypt.hash(plainTextPassword, 10);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: targetId },
        data: { passwordHash },
      });

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'CREDENTIAL_GENERATED',
          entity: 'USER',
          entityId: target.id,
          details: JSON.stringify({ reason: 'Admin reset password' }),
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        }
      });
    });

    await publishAdminEvent(
      'CREDENTIAL_GENERATED',
      target.id,
      `Credentials reset for employee: ${target.name}`,
      { employeeId: target.id },
      user.id
    );

    // Return the generated plainTextPassword exactly ONCE to the Super Admin
    return NextResponse.json({ 
      success: true, 
      data: { tempPassword: plainTextPassword } 
    });
  } catch (error) {
    console.error('Reset Password POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
