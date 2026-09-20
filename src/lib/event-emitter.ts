import { EventEmitter } from 'events';
import { prisma } from '@/lib/prisma';

// Create a singleton event emitter for the application
class AppEventEmitter extends EventEmitter {}

// Global instance to prevent re-instantiation in development during HMR
const globalForEvents = globalThis as unknown as {
  eventBus: AppEventEmitter | undefined;
};

export const eventBus = globalForEvents.eventBus ?? new AppEventEmitter();

if (process.env.NODE_ENV !== 'production') {
  globalForEvents.eventBus = eventBus;
}

// Define strict event types
export type AdminEventType = 
  | 'BOOKING_CREATED'
  | 'BOOKING_CANCELLED'
  | 'BOOKING_CONFIRMED'
  | 'LISTING_CREATED'
  | 'LISTING_APPROVED'
  | 'PAYMENT_RECEIVED'
  | 'DISPUTE_OPENED'
  | 'EMPLOYEE_CREATED'
  | 'EMPLOYEE_UPDATED'
  | 'CREDENTIAL_GENERATED'
  | 'PROPERTY_UNLISTED'
  | 'REVENUE_EARNED';

export interface AdminEventPayload {
  eventId: string;
  type: AdminEventType;
  entityId: string;
  timestamp: string;
  actorId?: string;
  data?: any;
  message: string;
}

// Helper to publish events
export const publishAdminEvent = async (type: AdminEventType, entityId: string, message: string, data?: any, actorId?: string) => {
  const payload: AdminEventPayload = {
    eventId: crypto.randomUUID(),
    type,
    entityId,
    timestamp: new Date().toISOString(),
    actorId,
    data,
    message,
  };
  
  // 1. Emit locally (works if same process)
  eventBus.emit('admin_event', payload);

  // 2. Persist to AuditLog (works cross-process)
  try {
    await prisma.auditLog.create({
      data: {
        action: type,
        entity: 'AdminEvent',
        entityId,
        userId: actorId || null,
        details: { message, data, payload } as any,
      }
    });
  } catch (e) {
    console.error('Failed to write event to AuditLog', e);
  }
};

export interface UserEventPayload {
  eventId: string;
  type: string;
  userId: string;
  timestamp: string;
  data?: any;
}

export const publishUserEvent = (userId: string, type: string, data?: any) => {
  const payload: UserEventPayload = {
    eventId: crypto.randomUUID(),
    type,
    userId,
    timestamp: new Date().toISOString(),
    data,
  };
  eventBus.emit(`user_event_${userId}`, payload);
};
