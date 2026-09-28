const fs = require('fs');
let content = fs.readFileSync('src/app/(dashboard)/guest/trips/page.tsx', 'utf8');

const filterLogic = `
  const requested = bookings.filter((b) => ['PENDING', 'REQUESTED', 'PENDING_APPROVAL'].includes(b.bookingStatus));
  const upcoming = bookings.filter((b) => ['APPROVED', 'PAYMENT_PENDING', 'PAYMENT_SUCCESS', 'CONFIRMED'].includes(b.bookingStatus) && new Date(b.checkIn || b.createdAt) >= new Date());
`;
content = content.replace(/const upcoming = bookings\.filter[^\n]+;/, filterLogic);

const tabsList = `
        <TabsList className="grid w-full grid-cols-4 md:w-[600px]">
          <TabsTrigger value="requested">Requested ({requested.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelled.length})</TabsTrigger>
        </TabsList>
`;
content = content.replace(/<TabsList className="grid w-full grid-cols-3 md:w-\[400px\]">[\s\S]*?<\/TabsList>/, tabsList);

const tabsContent = `
        <TabsContent value="requested" className="mt-4">{renderTrips(requested)}</TabsContent>
        <TabsContent value="upcoming" className="mt-4">{renderTrips(upcoming)}</TabsContent>
        <TabsContent value="past" className="mt-4">{renderTrips(past)}</TabsContent>
        <TabsContent value="cancelled" className="mt-4">{renderTrips(cancelled)}</TabsContent>
`;
content = content.replace(/<TabsContent value="upcoming" className="mt-4">\{renderTrips\(upcoming\)\}<\/TabsContent>[\s\S]*?<TabsContent value="cancelled" className="mt-4">\{renderTrips\(cancelled\)\}<\/TabsContent>/, tabsContent);

content = content.replace(/defaultValue="upcoming"/, 'defaultValue="requested"');

fs.writeFileSync('src/app/(dashboard)/guest/trips/page.tsx', content);
