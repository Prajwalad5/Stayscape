'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getInitials } from '@/lib/utils';
import { Send, Loader2, Home, Info } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function MessageThread({ conversationId, property, otherUser, initialMessages, currentUserId }: any) {
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>(initialMessages);
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Connect to SSE for realtime messages
  useEffect(() => {
    const es = new EventSource('/api/v1/user/events');
    
    es.addEventListener('user_event', (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.type === 'NEW_MESSAGE' && payload.data?.conversationId === conversationId) {
          const newMsg = payload.data.message;
          setMessages(prev => {
            if (prev.find(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      } catch (err) {}
    });

    return () => es.close();
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!content.trim()) return;

    setIsSending(true);
    try {
      const res = await fetch(`/api/v1/messages/${conversationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (!res.ok) throw new Error('Failed to send message');
      
      const newMsg = await res.json();
      setMessages((prev: any) => {
        if (prev.find((m: any) => m.id === newMsg.data.id)) return prev;
        return [...prev, newMsg.data];
      });
      setContent('');
    } catch {
      toast.error('Could not send message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="flex flex-col h-full shadow-md border-muted">
      <CardHeader className="border-b bg-muted/30 py-3 px-4 flex flex-row items-center gap-4 space-y-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={otherUser?.image || undefined} />
          <AvatarFallback>{getInitials(otherUser?.name || '?')}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="font-semibold">{otherUser?.name || 'Unknown User'}</h2>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Home className="h-3 w-3" /> {property?.title}
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
        {messages.map((msg: any) => {
          const isSystem = msg.isSystem;
          const isMe = msg.senderId === currentUserId && !isSystem;

          if (isSystem) {
            // Check if this system message is meant for ME.
            const isMeantForMe = 
              (msg.messageType === 'SYSTEM_GUEST_CONFIRMATION' && msg.senderId !== currentUserId) ||
              (msg.messageType === 'SYSTEM_HOST_NOTIFICATION' && msg.senderId !== currentUserId);
            
            if (!isMeantForMe) return null;

            return (
              <div key={msg.id} className="flex flex-col items-center my-6">
                <div className="w-full max-w-[90%] md:max-w-[75%] rounded-lg border bg-blue-50/50 p-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">SYSTEM MESSAGE</p>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed text-slate-700">{msg.content}</p>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground mt-2">
                  {format(new Date(msg.createdAt), 'MMM d, h:mm a')}
                </span>
              </div>
            );
          }

          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  isMe ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted text-foreground rounded-bl-sm'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 mx-1">
                {format(new Date(msg.createdAt), 'MMM d, h:mm a')}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </CardContent>

      <div className="p-4 bg-background border-t">
        <div className="flex items-end gap-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a message..."
            className="min-h-[60px] max-h-32 resize-none rounded-xl"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button 
            size="icon" 
            className="h-[60px] w-[60px] rounded-xl shrink-0" 
            onClick={handleSend}
            disabled={!content.trim() || isSending}
          >
            {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </Card>
  );
}
