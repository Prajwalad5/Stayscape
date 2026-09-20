const fs = require('fs');
let c = fs.readFileSync('src/app/admin-portal/finance/page.tsx', 'utf8');

c = c.replace(/export default async function AdminFinancePage\(\) \{/g, `export default async function AdminFinancePage({ searchParams }: { searchParams: { q?: string } }) {\n  const q = searchParams.q || '';\n`);

const oldPrismaQuery = `const payments = await prisma.payment.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { booking: { include: { property: true } } }
  });`;

const newPrismaQuery = `const payments = await prisma.payment.findMany({
    where: q ? {
      OR: [
        { id: { contains: q } },
        { providerPaymentId: { contains: q } },
        { receiptNumber: { contains: q } },
        { booking: { property: { title: { contains: q } } } },
      ]
    } : undefined,
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { booking: { include: { property: true } } }
  });`;

c = c.replace(oldPrismaQuery, newPrismaQuery);

const headerReplacement = `<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">Finance & Payments Ledger</h1>
        <form className="flex gap-2">
          <input 
            type="text" 
            name="q" 
            defaultValue={q} 
            placeholder="Search payments, receipts, properties..." 
            className="px-3 py-2 border rounded-md text-sm w-64" 
          />
          <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium">Search</button>
        </form>
      </div>`;
      
c = c.replace(/<h1 className="text-3xl font-bold">Finance & Payments Ledger<\/h1>/, headerReplacement);

fs.writeFileSync('src/app/admin-portal/finance/page.tsx', c);
