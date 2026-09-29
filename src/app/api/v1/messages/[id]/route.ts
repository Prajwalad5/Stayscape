export const dynamic = 'force-dynamic';
import { sanitizeHtml } from '@/lib/security';
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
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20'), 100);

    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id },
      include: {
        participants: true,
      }
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Conversation not found' } },
        { status: 404 }
      );
    }

    const isParticipant = conversation.participants.some(p => p.userId === userId);
    if (!isParticipant) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: params.id },
      orderBy: { createdAt: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        sender: {
          select: { id: true, name: true, image: true }
        }
      }
    });

    const total = await prisma.message.count({ where: { conversationId: params.id } });

    // Mark as read optionally
    const participant = conversation.participants.find(p => p.userId === userId);
    if (participant) {
      await prisma.conversationParticipant.update({
        where: { id: participant.id },
        data: { lastReadAt: new Date() }
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: messages,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
    });
  } catch (error) {
    console.error('ConversationGET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}

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
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ success: false, error: { code: 'INVALID_JSON', message: 'Malformed JSON body' } }, { status: 400 });
    }
    const { content, messageType, attachmentUrl } = body;
      const safeContent = sanitizeHtml(content);

    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id },
      include: { participants: true }
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Conversation not found' } },
        { status: 404 }
      );
    }

    const isParticipant = conversation.participants.some(p => p.userId === userId);
    if (!isParticipant) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }

    const message = await prisma.message.create({
      data: {
        content: safeContent,
        messageType: messageType || 'text',
        attachmentUrl,
        conversationId: params.id,
        senderId: userId,
      },
      include: {
        sender: { select: { id: true, name: true, image: true } }
      }
    });

    await prisma.conversation.update({
      where: { id: params.id },
      data: { lastMessageAt: new Date() }
    });

    // Realtime events
    import('@/lib/event-emitter').then(({ publishUserEvent }) => {
      conversation.participants.forEach(p => {
        publishUserEvent(p.userId, 'NEW_MESSAGE', { conversationId: params.id, message });
      });
    });

    return NextResponse.json({ success: true, data: message });
  } catch (error) {
    console.error('ConversationPOST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
