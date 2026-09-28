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
    const userRole = (session.user as any).role;
    const adminRole = (session.user as any).adminRole;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id }
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Ticket not found' } },
        { status: 404 }
      );
    }

    if (ticket.userId !== userId && userRole !== 'ADMIN' && !adminRole) {
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
    const { message, attachmentUrl } = body;

    const supportMessage = await prisma.supportMessage.create({
      data: {
        message,
        attachmentUrl,
        ticketId: params.id,
        senderId: userId
      }
    });

    await prisma.supportTicket.update({
      where: { id: params.id },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json({ success: true, data: supportMessage });
  } catch (error) {
    console.error('TicketMessagePOST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
