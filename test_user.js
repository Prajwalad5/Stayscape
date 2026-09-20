const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function test() {
  const user = await prisma.user.findUnique({ where: { email: "admin@stayscape.com" }});
  console.log("USER:", user);
}
test().finally(() => prisma.$disconnect());

