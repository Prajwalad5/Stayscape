const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// The enum definition should be:
// enum PaymentStatusEnum {
//   CREATED
//   PENDING
//   PAID
//   SUCCEEDED
//   FAILED
//   REFUNDED
//   CANCELLED
// }
schema = schema.replace(/enum PaymentStatusEnum \{[\s\S]*?\}/, `enum PaymentStatusEnum {
  CREATED
  PENDING
  PAID
  SUCCEEDED
  FAILED
  REFUNDED
  CANCELLED
}`);

// Fix the corrupted lines
//   REFUNDED
//   CANCELLED
//   CANCELLEDAmount        Int            @default(0)
schema = schema.replace(/REFUNDED\s*CANCELLED\s*CANCELLEDAmount\s*Int\s*@default\(0\)/, 'refundedAmount        Int            @default(0)');
schema = schema.replace(/REFUNDED\s*CANCELLEDAmount\s*Int\s*@default\(0\)/, 'refundedAmount        Int            @default(0)');

fs.writeFileSync('prisma/schema.prisma', schema);
