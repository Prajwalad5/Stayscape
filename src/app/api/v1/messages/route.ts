export const dynamic = 'force-dynamic';
import { sanitizeHtml } from '@/lib/security';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

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

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true, image: true },
            },
          },
        },
        property: {
          select: { id: true, title: true, images: true },
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, data: conversations });
  } catch (error) {
    console.error('MessagesGET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    
    const { participantId, listingId, bookingId, message } = body;
    const safeMessage = sanitizeHtml(message);

    if (!participantId || !message) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing fields' } },
        { status: 400 }
      );
    }

    // Check existing conversation
    const existing = await prisma.conversation.findFirst({
      where: {
        propertyId: listingId || null,
        bookingId: bookingId || null,
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: participantId } } }
        ]
      }
    });

    if (existing) {
      // Just create message
      const newMessage = await prisma.message.create({
        data: {
          content: safeMessage,
          conversationId: existing.id,
          senderId: userId,
        }
      });
      await prisma.conversation.update({
        where: { id: existing.id },
        data: { lastMessageAt: new Date() }
      });
      return NextResponse.json({ success: true, data: existing });
    }

    const conversation = await prisma.conversation.create({
      data: {
        propertyId: listingId,
        bookingId,
        lastMessageAt: new Date(),
        participants: {
          create: [
            { userId, role: 'guest' },
            { userId: participantId, role: 'host' }
          ]
        },
        messages: {
          create: {
            content: safeMessage,
            senderId: userId,
          }
        }
      },
      include: {
        participants: true
      }
    });

    return NextResponse.json({ success: true, data: conversation });
  } catch (error) {
    console.error('MessagesPOST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}

