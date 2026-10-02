export const dynamic = 'force-dynamic';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { MessageList } from '@/components/messages/message-list';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Messages' };

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const userId = (session.user as any).id;

  const conversations = await prisma.conversation.findMany({
    where: {
      participants: { some: { userId } },
    },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, image: true } } },
      },
      property: { select: { id: true, title: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const formattedConversations = conversations.map((conv) => {
    const otherParticipant = conv.participants.find(p => p.userId !== userId)?.user;
    const lastMessage = conv.messages[0];

    return {
      id: conv.id,
      property: conv.property,
      otherUser: otherParticipant,
      lastMessage,
      unreadCount: 0, // Simplified for now
    };
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">Messages</h1>
      <MessageList conversations={formattedConversations as any} />
    </div>
  );
}
