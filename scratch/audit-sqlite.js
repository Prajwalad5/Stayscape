const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function audit() {
  const models = Object.keys(prisma).filter(k => !k.startsWith('_') && !['$on', '$connect', '$disconnect', '$use', '$transaction', '$extends'].includes(k));
  
  let report = "SQLite Data Audit Report\n=======================\n";
  
  for (const model of models) {
    if (typeof prisma[model].count !== 'function') continue;
    try {
      const count = await prisma[model].count();
      report += `${model}: ${count} records\n`;
    } catch (e) {
      // Ignored
    }
  }
  
  const fs = require('fs');
  fs.writeFileSync('prisma/audit_report.txt', report);
  console.log("Audit complete");
}

audit().finally(() => prisma.$disconnect());
