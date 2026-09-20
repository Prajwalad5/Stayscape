const fs = require('fs');
let c = fs.readFileSync('src/app/(dashboard)/host/reservations/page.tsx', 'utf8');

c = c.replace(/\{booking\.bookingStatus === 'PENDING' && \(/g, "{['PENDING', 'PENDING_APPROVAL', 'REQUESTED'].includes(booking.bookingStatus) && (");

fs.writeFileSync('src/app/(dashboard)/host/reservations/page.tsx', c);
