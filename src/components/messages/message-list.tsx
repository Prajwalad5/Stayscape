'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import { MessageSquare } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export function MessageList({ conversations }: { conversations: any[] }) {
  if (conversations.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No messages"
        description="When you contact hosts or guests, your conversations will appear here."
      />
    );
  }

  return (
    <div className="space-y-4">
      {conversations.map((conv) => (
        <Link key={conv.id} href={`/messages/${conv.id}`}>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={conv.otherUser?.image || undefined} />
                <AvatarFallback>{getInitials(conv.otherUser?.name || '?')}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-semibold truncate">{conv.otherUser?.name || 'Unknown User'}</h3>
                  {conv.lastMessage && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: true })}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-1 truncate">{conv.property.title}</p>
                <p className="text-sm truncate text-foreground/80">
                  {conv.lastMessage?.content || 'No messages yet'}
                </p>
              </div>
              {conv.unreadCount > 0 && (
                <Badge variant="default" className="rounded-full h-6 w-6 flex items-center justify-center p-0">
                  {conv.unreadCount}
                </Badge>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
