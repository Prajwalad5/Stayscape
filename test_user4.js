const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function test() {
  const user = await prisma.user.findUnique({ where: { email: "prajwaladhikari212@gmail.com" }});
  console.log("lockedUntil:", user.lockedUntil, "loginAttempts:", user.loginAttempts);
}
test().finally(() => prisma.$disconnect());

