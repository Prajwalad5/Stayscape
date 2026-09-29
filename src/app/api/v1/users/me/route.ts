export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }
    
    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        userRoles: {
          include: {
            role: true
          }
        },
        _count: {
          select: {
            properties: true,
            bookings: true,
            reviewsGiven: true,
            favorites: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    // Format roles array
    const formattedUser = {
      ...user,
      roles: user.userRoles.map((r: any) => r.role.name)
    };

    return NextResponse.json({ success: true, data: formattedUser });
  } catch (error) {
    console.error('UsersMeRoute GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}

const updateProfileSchema = z.object({
  name: z.string().optional(),
  bio: z.string().optional(),
  phone: z.string().optional(),
  image: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  country: z.string().optional(),
  language: z.string().optional(),
  profilePhoto: z.string().optional(),
  isHost: z.boolean().optional()
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }
    
    const userId = (session.user as any).id;
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ success: false, error: { code: 'INVALID_JSON', message: 'Malformed JSON body' } }, { status: 400 });
    }
    const validated = updateProfileSchema.safeParse(body);
    
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: validated.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const {
      name, bio, phone, image,
      firstName, lastName, dateOfBirth, gender, country, language, profilePhoto,
      isHost
    } = validated.data;

    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(bio !== undefined && { bio }),
        ...(phone !== undefined && { phone }),
        ...(image !== undefined && { image }),
        profile: {
          upsert: {
            create: {
              firstName, lastName, 
              dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
              gender, country, language, profilePhoto
            },
            update: {
              ...(firstName !== undefined && { firstName }),
              ...(lastName !== undefined && { lastName }),
              ...(dateOfBirth !== undefined && { dateOfBirth: new Date(dateOfBirth) }),
              ...(gender !== undefined && { gender }),
              ...(country !== undefined && { country }),
              ...(language !== undefined && { language }),
              ...(profilePhoto !== undefined && { profilePhoto })
            }
          }
        }
      }
    });

    // Handle isHost toggle
    if (isHost !== undefined) {
      let hostRole = await prisma.role.findUnique({ where: { name: 'HOST' } });
      if (!hostRole) {
        hostRole = await prisma.role.create({ data: { name: 'HOST' } });
      }

      if (isHost) {
        // Assign HOST role if not already assigned
        const existingRole = await prisma.userRole.findFirst({
          where: { userId, roleId: hostRole.id }
        });
        if (!existingRole) {
          await prisma.userRole.create({
            data: { userId, roleId: hostRole.id }
          });
        }
      } else {
        // Remove HOST role if assigned
        await prisma.userRole.deleteMany({
          where: { userId, roleId: hostRole.id }
        });
      }
    }

    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true, data: { message: 'Profile updated successfully' } });
  } catch (error) {
    console.error('UsersMeRoute PATCH error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
