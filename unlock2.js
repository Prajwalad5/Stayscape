const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();
async function test() {
  const hashedPassword = await bcrypt.hash("Password123", 10);
  await prisma.user.update({
    where: { email: "admin@stayscape.com" },
    data: { lockedUntil: null, loginAttempts: 0, passwordHash: hashedPassword }
  });
  console.log("Account unlocked and password reset to Password123.");
}
test().finally(() => prisma.$disconnect());

