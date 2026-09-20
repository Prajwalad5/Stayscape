import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { eventBus, AdminEventPayload } from '@/lib/event-emitter';
import { prisma } from '@/lib/prisma';

// Prevent Next.js from statically generating or caching this route
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // Allows long-running connections up to 5 minutes on Vercel (if deployed)

export async function GET(req: NextRequest) {
  const session = await auth();
  
  // Ensure only admins can connect to this stream
  const user = session?.user as any;
  const isAdmin = user?.role === 'ADMIN' || !!user?.adminRole;
  if (!isAdmin) {
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

      // 1. Send initial connection success event
      sendEvent('connected', { status: 'established', timestamp: new Date().toISOString() });

      // 2. Define the listener for our local event bus (same process)
      const handleAdminEvent = (payload: AdminEventPayload) => {
        sendEvent('admin_event', payload);
      };
      eventBus.on('admin_event', handleAdminEvent);

      // 3. Database Polling (Outbox Pattern) for cross-process synchronization
      let lastCheckedTime = new Date();
      const pollInterval = setInterval(async () => {
        try {
          const newEvents = await prisma.auditLog.findMany({
            where: {
              entity: 'AdminEvent',
              createdAt: { gt: lastCheckedTime }
            },
            orderBy: { createdAt: 'asc' }
          });
          
          if (newEvents.length > 0) {
            lastCheckedTime = newEvents[newEvents.length - 1].createdAt;
            newEvents.forEach(evt => {
              if (evt.details && (evt.details as any).payload) {
                sendEvent('admin_event', (evt.details as any).payload);
              }
            });
          }
        } catch (e) {
          // Ignore DB poll errors
        }
      }, 1500);

      // 4. Keep-alive heartbeat (every 30 seconds)
      const heartbeatInterval = setInterval(() => {
        sendEvent('ping', { timestamp: new Date().toISOString() });
      }, 30000);

      // 5. Cleanup on client disconnect
      req.signal.addEventListener('abort', () => {
        eventBus.off('admin_event', handleAdminEvent);
        clearInterval(heartbeatInterval);
        clearInterval(pollInterval);
        try {
          controller.close();
        } catch (e) {
          // Ignore close errors
        }
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
