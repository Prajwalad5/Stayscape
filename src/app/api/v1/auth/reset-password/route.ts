import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

import { rateLimit, rateLimitResponse } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const ip = request.ip || request.headers.get('x-forwarded-for') || '127.0.0.1';
    const rl = rateLimit('register_' + ip, 5, 15 * 60 * 1000);
    if (!rl.allowed) return rateLimitResponse(rl.resetAt);
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ success: false, error: { code: 'INVALID_JSON', message: 'Malformed JSON body' } }, { status: 400 });
    }
    const validated = resetPasswordSchema.safeParse(body);
    
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: validated.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const { token, password } = validated.data;

    const passwordReset = await prisma.passwordReset.findFirst({
      where: {
        token,
        usedAt: null,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (!passwordReset) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_TOKEN', message: 'Invalid or expired password reset token' } },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Transaction to update password, invalidate sessions, and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: passwordReset.userId },
        data: { passwordHash }
      }),
      prisma.passwordReset.update({
        where: { id: passwordReset.id },
        data: { usedAt: new Date() }
      }),
      prisma.session.deleteMany({
        where: { userId: passwordReset.userId }
      })
    ]);

    return NextResponse.json(
      { success: true, data: { message: 'Password has been successfully reset' } },
      { status: 200 }
    );
  } catch (error) {
    console.error('ResetPasswordRoute error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}

