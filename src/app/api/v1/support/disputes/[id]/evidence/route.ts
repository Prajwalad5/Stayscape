export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(
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

    const dispute = await prisma.dispute.findUnique({
      where: { id: params.id },
      include: {
        booking: {
          include: { property: true }
        }
      }
    });

    if (!dispute) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Dispute not found' } },
        { status: 404 }
      );
    }

    const isParticipant = dispute.booking.guestId === userId || dispute.booking.property.hostId === userId;
    if (!isParticipant) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }

    let body;

    try {

      body = await request.json();

    } catch (e) {

      return NextResponse.json({ success: false, error: { code: 'INVALID_JSON', message: 'Malformed JSON body' } }, { status: 400 });

    }
    const { fileUrl, fileType } = body;

    if (!fileUrl) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'FileUrl is required' } },
        { status: 400 }
      );
    }

    const evidence = await prisma.disputeEvidence.create({
      data: {
        disputeId: params.id,
        fileUrl,
        fileType: fileType || 'IMAGE'
      }
    });

    return NextResponse.json({ success: true, data: evidence });
  } catch (error) {
    console.error('DisputeEvidencePOST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
