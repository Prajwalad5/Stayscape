export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
});

import { rateLimit, rateLimitResponse } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const ip = request.ip || request.headers.get('x-forwarded-for') || '127.0.0.1';
    const rl = rateLimit('forgot_' + ip, 3, 15 * 60 * 1000);
    if (!rl.allowed) return rateLimitResponse(rl.resetAt);
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ success: false, error: { code: 'INVALID_JSON', message: 'Malformed JSON body' } }, { status: 400 });
    }
    const validated = forgotPasswordSchema.safeParse(body);
    
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: validated.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const { email } = validated.data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const token = crypto.randomUUID();
      
      await prisma.passwordReset.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        }
      });

      console.log(`Would send password reset email to ${email} with token ${token}`);
    }

    // Always return 200 to prevent email enumeration
    return NextResponse.json(
      { success: true, data: { message: 'If an account exists, a password reset email has been sent.' } },
      { status: 200 }
    );
  } catch (error) {
    console.error('ForgotPasswordRoute error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}

