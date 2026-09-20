const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      adminRole: true,
      managementId: true,
      loginId: true,
      status: true,
      department: true,
    }
  });
  console.log(JSON.stringify(admins, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
