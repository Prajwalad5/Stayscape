const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function test() {
  const user = await prisma.user.findUnique({ where: { email: "prajwaladhikari212@gmail.com" }});
  console.log("passwordHash exists?", !!user.passwordHash);
}
test().finally(() => prisma.$disconnect());

