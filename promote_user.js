const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function test() {
  await prisma.user.update({
    where: { email: "prajwaladhikari212@gmail.com" },
    data: { 
      adminRole: "SUPER_ADMIN",
      permissions: JSON.stringify(["users.view", "users.edit", "listings.view", "payments.view", "commissions.manage", "ads.manage", "settings.manage", "payouts.release", "bookings.view", "bookings.cancel"])
    }
  });
  console.log("Granted SUPER_ADMIN to prajwaladhikari212@gmail.com");
}
test().finally(() => prisma.$disconnect());

