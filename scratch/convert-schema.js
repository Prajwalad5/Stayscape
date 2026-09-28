const fs = require('fs');

let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// 1. Change provider
schema = schema.replace('provider = "sqlite"', 'provider = "postgresql"');

// 2. Add enums at the top
const enums = `
enum UserRoleEnum {
  USER
  GUEST
  HOST
  SUPPORT
  MODERATOR
  ADMIN
  SUPER_ADMIN
}

enum PropertyStatusEnum {
  DRAFT
  PENDING
  PUBLISHED
  UNPUBLISHED
  APPROVED
  REJECTED
  ACTIVE
  INACTIVE
}

enum BookingStatusEnum {
  REQUESTED
  PENDING_APPROVAL
  PAYMENT_PENDING
  CONFIRMED
  COMPLETED
  CANCELLED
  REJECTED
  CONFLICTED
}

enum PaymentStatusEnum {
  CREATED
  PENDING
  PAID
  SUCCEEDED
  FAILED
  REFUNDED
}
`;

schema = schema.replace(/model Account \{/, enums + '\nmodel Account {');

// 3. Replace String with Enums where appropriate
schema = schema.replace(/role\s+String\s+@default\("USER"\)/, 'role UserRoleEnum @default(USER)');
schema = schema.replace(/status\s+String\s+@default\("DRAFT"\)/g, 'status PropertyStatusEnum @default(DRAFT)');
// Note: Booking has bookingStatus, Payment has status
schema = schema.replace(/bookingStatus\s+String\s+@default\("REQUESTED"\)/, 'bookingStatus BookingStatusEnum @default(REQUESTED)');
schema = schema.replace(/paymentStatus\s+String\s+@default\("CREATED"\)/, 'paymentStatus PaymentStatusEnum @default(CREATED)');
schema = schema.replace(/status\s+String\s+@default\("CREATED"\)/g, 'status PaymentStatusEnum @default(CREATED)'); // For Payment

fs.writeFileSync('prisma/schema.postgres.prisma', schema);
