const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);
  
  await prisma.user.upsert({
    where: { email: "admin@stayscape.com" },
    update: {
      adminRole: "SUPER_ADMIN",
      permissions: JSON.stringify(["users.view", "users.edit", "listings.view", "payments.view"])
    },
    create: {
      email: "admin@stayscape.com",
      name: "Super Admin",
      passwordHash: hashedPassword,
      role: "ADMIN",
      adminRole: "SUPER_ADMIN",
      permissions: JSON.stringify(["users.view", "users.edit", "listings.view", "payments.view"])
    }
  });
  
  await prisma.advertisement.create({
    data: {
      title: "Host your home on StayScape!",
      description: "Earn extra income by becoming a host today.",
      targetUrl: "/host/get-started",
      placement: "HOMEPAGE_BANNER",
      targetAudience: "ALL",
      status: "ACTIVE",
      priority: 10
    }
  });

  console.log("Admin seeded successfully.");
}

main().catch(console.error).finally(() => prisma.$disconnect());

