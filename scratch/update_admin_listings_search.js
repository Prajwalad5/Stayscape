const fs = require('fs');
let c = fs.readFileSync('src/app/admin-portal/listings/page.tsx', 'utf8');

c = c.replace(/export default async function AdminListingsPage\(\) \{/g, `export default async function AdminListingsPage({ searchParams }: { searchParams: { q?: string } }) {\n  const q = searchParams.q || '';`);

const oldPrismaQuery = `const listings = await prisma.property.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      host: { select: { name: true, email: true, id: true } }
    }
  });`;

const newPrismaQuery = `const listings = await prisma.property.findMany({
    where: q ? {
      OR: [
        { id: { contains: q } },
        { title: { contains: q } },
        { city: { contains: q } },
        { host: { name: { contains: q } } }
      ]
    } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      host: { select: { name: true, email: true, id: true } }
    },
    take: 100,
  });`;

c = c.replace(oldPrismaQuery, newPrismaQuery);

const headerReplacement = `<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">Listings Management</h1>
        <form className="flex gap-2">
          <input 
            type="text" 
            name="q" 
            defaultValue={q} 
            placeholder="Search title, ID, host, city..." 
            className="px-3 py-2 border rounded-md text-sm w-64" 
          />
          <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium">Search</button>
        </form>
      </div>`;
      
c = c.replace(/<div className="flex justify-between items-center">\s*<h1 className="text-3xl font-bold">Listings Management<\/h1>\s*<\/div>/, headerReplacement);

fs.writeFileSync('src/app/admin-portal/listings/page.tsx', c);
