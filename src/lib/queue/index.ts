import { prisma } from '@/lib/prisma';

// ============================================
// JOB QUEUE SYSTEM (DB-backed with retry)
// ============================================

export interface JobPayload {
  [key: string]: any;
}

export async function enqueueJob(queueName: string, payload: JobPayload, maxAttempts: number = 3) {
  return prisma.job.create({
    data: {
      queueName,
      payload: payload as any,
      status: 'PENDING',
      maxAttempts,
    },
  });
}

export async function enqueueNotification(
  type: 'email' | 'sms' | 'push',
  payload: JobPayload,
  maxAttempts: number = 3
) {
  return prisma.notificationQueue.create({
    data: {
      type,
      payload: payload as any,
      status: 'PENDING',
      maxAttempts,
    },
  });
}

export async function processJobs(queueName: string, handler: (payload: any) => Promise<void>, batchSize: number = 10) {
  const jobs = await prisma.job.findMany({
    where: {
      queueName,
      status: { in: ['PENDING', 'FAILED'] },
      OR: [
        { nextRetryAt: null },
        { nextRetryAt: { lte: new Date() } },
      ],
    },
    orderBy: { createdAt: 'asc' },
    take: batchSize,
  });

  for (const job of jobs) {
    try {
      await prisma.job.update({
        where: { id: job.id },
        data: { status: 'PROCESSING' },
      });

      await handler(job.payload);

      await prisma.job.update({
        where: { id: job.id },
        data: { status: 'COMPLETED', processedAt: new Date() },
      });
    } catch (error: any) {
      const attempts = job.attempts + 1;
      const isDeadLetter = attempts >= job.maxAttempts;
      const backoffMs = Math.min(1000 * Math.pow(2, attempts), 3600000); // max 1 hour

      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: isDeadLetter ? 'DEAD_LETTER' : 'FAILED',
          attempts,
          error: error?.message || 'Unknown error',
          nextRetryAt: isDeadLetter ? null : new Date(Date.now() + backoffMs),
        },
      });
    }
  }

  return jobs.length;
}

export async function processNotificationQueue(handler: (type: string, payload: any) => Promise<void>, batchSize: number = 10) {
  const items = await prisma.notificationQueue.findMany({
    where: {
      status: { in: ['PENDING', 'FAILED'] },
      OR: [
        { nextRetryAt: null },
        { nextRetryAt: { lte: new Date() } },
      ],
    },
    orderBy: { createdAt: 'asc' },
    take: batchSize,
  });

  for (const item of items) {
    try {
      await prisma.notificationQueue.update({
        where: { id: item.id },
        data: { status: 'PROCESSING' },
      });

      await handler(item.type, item.payload);

      await prisma.notificationQueue.update({
        where: { id: item.id },
        data: { status: 'COMPLETED', processedAt: new Date() },
      });
    } catch (error: any) {
      const attempts = item.attempts + 1;
      const isDeadLetter = attempts >= item.maxAttempts;
      const backoffMs = Math.min(1000 * Math.pow(2, attempts), 3600000);

      await prisma.notificationQueue.update({
        where: { id: item.id },
        data: {
          status: isDeadLetter ? 'DEAD_LETTER' : 'FAILED',
          attempts,
          error: error?.message || 'Unknown error',
          nextRetryAt: isDeadLetter ? null : new Date(Date.now() + backoffMs),
        },
      });
    }
  }

  return items.length;
}
