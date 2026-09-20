const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// User model: Add emailSearchHash
schema = schema.replace(/emailVerified\s+DateTime\?/g, 'emailVerified           DateTime?\n  emailSearchHash         String?                   @unique');

// Payment model: Add receiptNumber, depositAmount
if (!schema.includes('receiptNumber')) {
  schema = schema.replace(/providerPaymentId\s+String\?\s+@unique/g, 'providerPaymentId     String?        @unique\n  receiptNumber         String?        @unique\n  depositAmount         Int            @default(0)');
}

// Booking model: Change default status to REQUESTED
schema = schema.replace(/bookingStatus\s+String\s+@default\("PENDING_PAYMENT"\)/g, 'bookingStatus          String                 @default("REQUESTED")');

fs.writeFileSync('prisma/schema.prisma', schema);
