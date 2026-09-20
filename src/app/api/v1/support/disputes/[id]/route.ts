import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }
    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;
    const adminRole = (session.user as any).adminRole;

    const dispute = await prisma.dispute.findUnique({
      where: { id: params.id },
      include: {
        booking: {
          include: { property: true }
        },
        evidence: true
      }
    });

    if (!dispute) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Dispute not found' } },
        { status: 404 }
      );
    }

    const isParticipant = dispute.booking.guestId === userId || dispute.booking.property.hostId === userId;
    if (!isParticipant && userRole !== 'ADMIN' && !adminRole) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: dispute });
  } catch (error) {
    console.error('DisputeGET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
