const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function test() {
  await prisma.user.update({
    where: { email: "admin@stayscape.com" },
    data: { lockedUntil: null, loginAttempts: 0 }
  });
  console.log("Account unlocked.");
}
test().finally(() => prisma.$disconnect());

