export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: { message: 'Not authenticated' } }, { status: 401 });
    }

    const userId = (session.user as any).id;
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ success: false, error: { code: 'INVALID_JSON', message: 'Malformed JSON body' } }, { status: 400 });
    }
    const { conversationId, content, propertyId } = body;

    // Verify conversation access
    if (conversationId) {
      const conv = await prisma.conversation.findFirst({
        where: { id: conversationId, participants: { some: { userId } } }
      });
      if (!conv) return NextResponse.json({ success: false, error: { message: 'Conversation not found' } }, { status: 404 });
    }

    let targetConvId = conversationId;

    // Create new conversation if needed
    if (!conversationId && propertyId) {
      // Find property host
      const property = await prisma.property.findUnique({ where: { id: propertyId } });
      if (!property) return NextResponse.json({ success: false, error: { message: 'Property not found' } }, { status: 404 });
      
      const newConv = await prisma.conversation.create({
        data: {
          propertyId,
          participants: {
            create: [{ userId }, { userId: property.hostId }]
          }
        }
      });
      targetConvId = newConv.id;
    }

    if (!targetConvId || !content) {
      return NextResponse.json({ success: false, error: { message: 'Missing parameters' } }, { status: 400 });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId: targetConvId,
        senderId: userId,
        content,
      },
      include: {
        sender: { select: { id: true, name: true, image: true } }
      }
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: targetConvId },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json({ success: true, data: message }, { status: 201 });
  } catch (error) {
    console.error('Message POST error:', error);
    return NextResponse.json({ success: false, error: { message: 'Internal Server Error' } }, { status: 500 });
  }
}
