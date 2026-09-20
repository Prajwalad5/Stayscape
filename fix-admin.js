const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.user.update({
    where: { email: 'admin@stayscape.com' },
    data: {
      adminRole: 'SUPER_ADMIN',
      managementId: 'ADM-00001',
      department: 'Administration',
    }
  });
  console.log('Updated admin:', JSON.stringify(updated, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
