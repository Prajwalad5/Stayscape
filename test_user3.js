const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function test() {
  const user = await prisma.user.findUnique({ where: { email: "admin@stayscape.com" }});
  console.log("lockedUntil:", user.lockedUntil, "loginAttempts:", user.loginAttempts);
}
test().finally(() => prisma.$disconnect());

