import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id, deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        isHost: true,
        bio: true,
        phone: true,
        createdAt: true,
        _count: {
          select: {
            properties: true,
            bookings: true,
            reviewsGiven: true,
            favorites: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    let body;

    try {

      body = await request.json();

    } catch (e) {

      return NextResponse.json({ success: false, error: { code: 'INVALID_JSON', message: 'Malformed JSON body' } }, { status: 400 });

    }
    const userId = (session.user as any).id;

    // Allowed fields to update
    const allowedFields: Record<string, any> = {};

    if (typeof body.name === 'string') allowedFields.name = body.name;
    if (typeof body.bio === 'string') allowedFields.bio = body.bio;
    if (typeof body.phone === 'string') allowedFields.phone = body.phone;
    if (typeof body.image === 'string') allowedFields.image = body.image;

    // Handle becoming a host
    if (body.isHost === true) {
      allowedFields.isHost = true;
      allowedFields.role = 'HOST';
    }

    // Handle switching back to guest
    if (body.isHost === false) {
      allowedFields.isHost = false;
      allowedFields.role = 'GUEST';
    }

    if (Object.keys(allowedFields).length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'No valid fields to update' } },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: allowedFields,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        isHost: true,
      },
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
