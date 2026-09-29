export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
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
    const validated = registerSchema.safeParse(body);
    
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: validated.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const { name, email, password } = validated.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: { code: 'CONFLICT', message: 'User with this email already exists' } },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Find or create GUEST role
    let guestRole = await prisma.role.findUnique({ where: { name: 'GUEST' } });
    if (!guestRole) {
      guestRole = await prisma.role.create({ data: { name: 'GUEST' } });
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        profile: {
          create: {} // Create empty profile
        },
        userRoles: {
          create: {
            roleId: guestRole.id
          }
        }
      },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });

    // Try to send welcome email
    try {
      console.log(`Sending welcome email to ${email}...`);
      // Email logic here
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          roles: newUser.userRoles.map((r: any) => r.role.name)
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('RegisterRoute error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}

