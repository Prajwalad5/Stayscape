export const dynamic = 'force-dynamic';
import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { MessageThread } from '@/components/messages/message-thread';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Conversation' };

export default async function ConversationPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const userId = (session.user as any).id;

  const conversation = await prisma.conversation.findUnique({
    where: { id: params.id },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, image: true } } },
      },
      property: { select: { id: true, title: true } },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: { sender: { select: { id: true, name: true, image: true } } },
      },
    },
  });

  if (!conversation || !conversation.participants.some(p => p.userId === userId)) {
    notFound();
  }

  const otherParticipant = conversation.participants.find(p => p.userId !== userId)?.user;

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-200px)] min-h-[500px]">
      <MessageThread
        conversationId={conversation.id}
        property={conversation.property}
        otherUser={otherParticipant}
        initialMessages={conversation.messages}
        currentUserId={userId}
      />
    </div>
  );
}
