const fs = require('fs');
let c = fs.readFileSync('src/app/admin-portal/bookings/page.tsx', 'utf8');

c = c.replace(/export default async function AdminBookingsPage\(\) \{/g, `export default async function AdminBookingsPage({ searchParams }: { searchParams: { q?: string } }) {\n  const q = searchParams.q || '';`);

const oldPrismaQuery = `const bookings = await prisma.booking.findMany({
    include: {
      property: {
        select: {
          title: true,
          city: true,
        },
      },
      guest: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });`;

const newPrismaQuery = `const bookings = await prisma.booking.findMany({
    where: q ? {
      OR: [
        { id: { contains: q } },
        { bookingNumber: { contains: q } },
        { guest: { name: { contains: q } } },
        { property: { title: { contains: q } } }
      ]
    } : undefined,
    include: {
      property: { select: { title: true, city: true } },
      guest: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });`;

c = c.replace(oldPrismaQuery, newPrismaQuery);

const headerReplacement = `<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">Bookings Management</h1>
        <form className="flex gap-2">
          <input 
            type="text" 
            name="q" 
            defaultValue={q} 
            placeholder="Search booking ID, property, guest..." 
            className="px-3 py-2 border rounded-md text-sm w-64" 
          />
          <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium">Search</button>
        </form>
      </div>`;
      
c = c.replace(/<div className="flex justify-between items-center">\s*<h1 className="text-3xl font-bold">Bookings Management<\/h1>\s*<\/div>/, headerReplacement);

fs.writeFileSync('src/app/admin-portal/bookings/page.tsx', c);
