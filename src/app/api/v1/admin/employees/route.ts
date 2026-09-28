import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { publishAdminEvent } from '@/lib/event-emitter';

const createEmployeeSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  department: z.string().optional(),
  adminRole: z.string().min(1),
  status: z.enum(['ACTIVE', 'SUSPENDED']).default('ACTIVE'),
  image: z.string().optional(),
  password: z.string().min(8),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const sessionUser = session?.user as any;
    
    if (!sessionUser || (sessionUser.role !== 'ADMIN' && !sessionUser.adminRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch fresh adminRole from DB (JWT may be stale)
    const freshUser = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { adminRole: true },
    });

    if (!freshUser || freshUser.adminRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');

    const where: any = { role: 'ADMIN' };
    if (role && role !== 'ALL') where.adminRole = role;
    if (status && status !== 'ALL') where.status = status;

    const employees = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        adminRole: true,
        department: true,
        status: true,
        image: true,
        managementId: true,
        loginId: true,
        createdAt: true,
        lastLoginAt: true,
        suspendedAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: employees });
  } catch (error) {
    console.error('Employees GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
      return NextResponse.json({ error: 'Forbidden. Only Super Admins can create employees.' }, { status: 403 });
    }
    const user = freshUser;

    let body;

    try {

      body = await request.json();

    } catch (e) {

      return NextResponse.json({ success: false, error: { code: 'INVALID_JSON', message: 'Malformed JSON body' } }, { status: 400 });

    }
    const validated = createEmployeeSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: 'Invalid input', details: validated.error.flatten().fieldErrors }, { status: 400 });
    }

    const data = validated.data;

    // Check existing
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    // Generate Management ID based on Role
    let rolePrefix = 'ADM';
    if (data.adminRole === 'BOOKING_ADMIN') rolePrefix = 'BOOK';
    if (data.adminRole === 'LISTING_ADMIN') rolePrefix = 'LIST';
    if (data.adminRole === 'FINANCE_ADMIN') rolePrefix = 'FIN';
    
    // Simple sequential logic for ID or random
    const count = await prisma.user.count({ where: { role: 'ADMIN' } });
    const managementId = `${rolePrefix}-${String(count + 1).padStart(5, '0')}`;
    
    // Generate Login ID based on name or email prefix + random
    const baseName = data.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const loginId = `${baseName}.${Math.floor(Math.random() * 1000)}`;

    const newEmployee = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          department: data.department,
          role: 'ADMIN',
          adminRole: data.adminRole,
          status: data.status,
          image: data.image,
          passwordHash,
          managementId,
          loginId,
          emailVerified: new Date(),
        }
      });

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'EMPLOYEE_CREATED',
          entity: 'USER',
          entityId: created.id,
          details: JSON.stringify({ role: data.adminRole, email: data.email }),
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        }
      });

      return created;
    });

    // Fire real-time event
    await publishAdminEvent(
      'EMPLOYEE_CREATED',
      newEmployee.id,
      `New employee created: ${newEmployee.name} (${newEmployee.adminRole})`,
      { employeeId: newEmployee.id, role: newEmployee.adminRole },
      user.id
    );

    const { passwordHash: _, ...employeeData } = newEmployee;
    return NextResponse.json({ success: true, data: employeeData }, { status: 201 });
  } catch (error) {
    console.error('Employees POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
