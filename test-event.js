const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

async function testEvent() {
  const payload = {
    eventId: crypto.randomUUID(),
    type: 'BOOKING_CREATED',
    entityId: 'test-booking-123',
    timestamp: new Date().toISOString(),
    message: 'Test booking created directly from script',
  };

  await prisma.auditLog.create({
    data: {
      action: 'BOOKING_CREATED',
      entity: 'AdminEvent',
      entityId: 'test-booking-123',
      userId: null,
      details: { message: payload.message, payload },
    }
  });
  console.log('Test event inserted!');
  await prisma.$disconnect();
}

testEvent();
