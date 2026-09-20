const fs = require('fs');
let c = fs.readFileSync('src/app/admin-portal/users/page.tsx', 'utf8');

c = c.replace(/export default async function AdminUsersPage\(\) \{/g, `export default async function AdminUsersPage({ searchParams }: { searchParams: { q?: string } }) {\n  const q = searchParams.q || '';`);

const oldPrismaQuery = `const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });`;

const newPrismaQuery = `const users = await prisma.user.findMany({
    where: q ? {
      OR: [
        { name: { contains: q } },
        { email: { contains: q } },
        { id: { contains: q } }
      ]
    } : { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });`;

c = c.replace(oldPrismaQuery, newPrismaQuery);

const headerReplacement = `<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">User Management</h1>
        <form className="flex gap-2">
          <input 
            type="text" 
            name="q" 
            defaultValue={q} 
            placeholder="Search name, email, ID..." 
            className="px-3 py-2 border rounded-md text-sm w-64" 
          />
          <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium">Search</button>
        </form>
      </div>`;
      
c = c.replace(/<div className="flex justify-between items-center">\s*<h1 className="text-3xl font-bold">User Management<\/h1>\s*<\/div>/, headerReplacement);

fs.writeFileSync('src/app/admin-portal/users/page.tsx', c);
