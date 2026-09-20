const fs = require('fs');
let c = fs.readFileSync('src/app/(dashboard)/host/reservations/page.tsx', 'utf8');

c = c.replace(/export default async function HostReservationsPage\(\) \{/g, `export default async function HostReservationsPage({ searchParams }: { searchParams: { q?: string } }) {\n  const q = searchParams.q || '';`);

const oldPrismaQuery = `const bookings = await prisma.booking.findMany({
    where: { property: { hostId: (session.user as any).id } },
    include: {
      property: { select: { id: true, title: true, rentalType: true } },
      guest: { select: { id: true, name: true, image: true, email: true } },
      conversation: { select: { id: true } },
    },
    orderBy: { createdAt: 'desc' },
  });`;

const newPrismaQuery = `const bookings = await prisma.booking.findMany({
    where: { 
      property: { hostId: (session.user as any).id },
      ...(q ? {
        OR: [
          { id: { contains: q } },
          { bookingNumber: { contains: q } },
          { guest: { name: { contains: q } } },
          { property: { title: { contains: q } } }
        ]
      } : {})
    },
    include: {
      property: { select: { id: true, title: true, rentalType: true } },
      guest: { select: { id: true, name: true, image: true, email: true } },
      conversation: { select: { id: true } },
    },
    orderBy: { createdAt: 'desc' },
  });`;

c = c.replace(oldPrismaQuery, newPrismaQuery);

const headerReplacement = `<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reservations</h1>
          <p className="text-muted-foreground mt-1">Manage your incoming and active bookings.</p>
        </div>
        <form className="flex gap-2 w-full md:w-auto">
          <input 
            type="text" 
            name="q" 
            defaultValue={q} 
            placeholder="Search bookings, guests..." 
            className="px-3 py-2 border rounded-md text-sm flex-1 md:w-64" 
          />
          <Button type="submit" variant="secondary">Search</Button>
        </form>
      </div>`;
      
c = c.replace(/<div className="mb-8">\s*<h1 className="text-3xl font-bold tracking-tight">Reservations<\/h1>\s*<p className="text-muted-foreground mt-1">Manage your incoming and active bookings\.<\/p>\s*<\/div>/, headerReplacement);

fs.writeFileSync('src/app/(dashboard)/host/reservations/page.tsx', c);
