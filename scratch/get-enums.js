const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const userRoles = await prisma.user.groupBy({ by: ['role'] });
  const propertyStatuses = await prisma.property.groupBy({ by: ['status'] });
  const bookingStatuses = await prisma.booking.groupBy({ by: ['bookingStatus'] });
  const paymentStatuses = await prisma.payment.groupBy({ by: ['status'] });
  
  console.log("User roles:", userRoles.map(r => r.role));
  console.log("Property statuses:", propertyStatuses.map(r => r.status));
  console.log("Booking statuses:", bookingStatuses.map(r => r.bookingStatus));
  console.log("Payment statuses:", paymentStatuses.map(r => r.status));
}

check().finally(() => prisma.$disconnect());
