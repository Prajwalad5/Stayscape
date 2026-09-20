const fs = require('fs');
let c = fs.readFileSync('src/app/api/bookings/route.ts', 'utf8');

c = c.replace(/bookingStatus:\s*\{\s*in:\s*\['PENDING_PAYMENT',\s*'CONFIRMED'\]\s*\}/g, "bookingStatus: { in: ['APPROVED', 'PAYMENT_PENDING', 'PAYMENT_SUCCESS', 'CONFIRMED'] }");
c = c.replace(/bookingStatus:\s*'PENDING_PAYMENT'/g, "bookingStatus: 'PENDING_APPROVAL'");
c = c.replace(/\$\{newBooking\.bookingStatus\}/g, "PENDING_APPROVAL");

fs.writeFileSync('src/app/api/bookings/route.ts', c);
