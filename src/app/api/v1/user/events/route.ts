import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { eventBus, UserEventPayload } from '@/lib/event-emitter';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const session = await auth();
  
  const userId = (session?.user as any)?.id;
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      const sendEvent = (event: string, data: any) => {
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch (e) {
          console.error('Failed to encode/enqueue SSE message', e);
        }
      };

      sendEvent('connected', { status: 'established', timestamp: new Date().toISOString() });

      const handleUserEvent = (payload: UserEventPayload) => {
        sendEvent('user_event', payload);
      };
      
      eventBus.on(`user_event_${userId}`, handleUserEvent);

      const pingInterval = setInterval(() => {
        sendEvent('ping', { timestamp: new Date().toISOString() });
      }, 30000);

      req.signal.addEventListener('abort', () => {
        clearInterval(pingInterval);
        eventBus.off(`user_event_${userId}`, handleUserEvent);
        try {
          controller.close();
        } catch (e) {}
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
