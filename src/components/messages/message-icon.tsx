'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MessageIcon({ userId }: { userId: string }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Initial fetch
    fetch('/api/v1/messages/unread')
      .then(r => r.json())
      .then(d => {
        if (d.success) setUnreadCount(d.data.count);
      })
      .catch(() => {});

    // Realtime SSE
    const es = new EventSource('/api/v1/user/events');
    
    es.addEventListener('user_event', (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.type === 'NEW_MESSAGE' && payload.data?.message?.senderId !== userId) {
          setUnreadCount(prev => prev + 1);
        } else if (payload.type === 'MESSAGES_READ') {
          setUnreadCount(0); // or decrement based on logic
        }
      } catch (err) {}
    });

    return () => es.close();
  }, [userId]);

  return (
    <Button variant="ghost" size="icon" asChild className="relative rounded-full mr-2 hidden md:flex">
      <Link href="/messages">
        <MessageSquare className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Link>
    </Button>
  );
}
