'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface RealTimeListenerProps {
  children: React.ReactNode;
}

export function RealTimeListener({ children }: RealTimeListenerProps) {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    let reconnectAttempts = 0;
    const maxReconnectDelay = 10000;

    const connect = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const es = new EventSource('/api/v1/admin/events');
      eventSourceRef.current = es;

      es.onopen = () => {
        setIsConnected(true);
        reconnectAttempts = 0; // Reset on successful connection
      };

      es.addEventListener('connected', (e) => {
        console.log('[RealTime] Connected to Admin Event Stream');
      });

      const seenEvents = new Set<string>();

      es.addEventListener('admin_event', (e) => {
        try {
          const payload = JSON.parse(e.data);
          
          // Deduplication (prevents double-firing if local bus + DB outbox both catch it)
          if (seenEvents.has(payload.eventId)) return;
          seenEvents.add(payload.eventId);
          if (seenEvents.size > 100) {
            const first = seenEvents.values().next().value;
            if (first) seenEvents.delete(first);
          }

          console.log('[RealTime] Received Event:', payload);
          
          // Show toast notification to the admin
          toast.info(payload.message, {
            description: new Date(payload.timestamp).toLocaleTimeString(),
          });

          // Triggers Next.js to silently refetch Server Components
          // This ensures the dashboard tables and stats update automatically!
          router.refresh();
        } catch (err) {
          console.error('Failed to parse event data', err);
        }
      });

      es.addEventListener('ping', () => {
        // Heartbeat received
      });

      es.onerror = (err) => {
        setIsConnected(false);
        es.close();
        
        // Exponential backoff for reconnection
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), maxReconnectDelay);
        reconnectAttempts++;
        
        console.warn(`[RealTime] Connection lost. Reconnecting in ${delay}ms...`);
        reconnectTimeoutRef.current = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [router]);

  return (
    <>
      {children}
      {/* Optional: A tiny status indicator for admins */}
      <div 
        className={`fixed bottom-4 left-4 h-2 w-2 rounded-full shadow-md z-50 ${isConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} 
        title={isConnected ? 'Real-time connected' : 'Reconnecting...'}
      />
    </>
  );
}
