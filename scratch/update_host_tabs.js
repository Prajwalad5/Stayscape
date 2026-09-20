const fs = require('fs');
let c = fs.readFileSync('src/app/(dashboard)/host/reservations/page.tsx', 'utf8');

c = c.replace(/const pending = bookings\.filter\(b => b\.bookingStatus === 'PENDING'\);/g, 
"const pending = bookings.filter(b => ['PENDING', 'PENDING_APPROVAL', 'REQUESTED'].includes(b.bookingStatus));");

c = c.replace(/const upcoming = bookings\.filter\(b => \['CONFIRMED', 'PENDING_PAYMENT'\]\.includes\(b\.bookingStatus\)\);/g,
"const upcoming = bookings.filter(b => ['APPROVED', 'PAYMENT_PENDING', 'PAYMENT_SUCCESS', 'CONFIRMED'].includes(b.bookingStatus) && new Date(b.checkIn || b.startDate || new Date(9999,0,1)) > new Date());");

c = c.replace(/const active = bookings\.filter\(b => b\.bookingStatus === 'CONFIRMED' && new Date\(b\.checkIn \|\| b\.startDate \|\| new Date\(\)\) <= new Date\(\) && new Date\(b\.checkOut \|\| b\.endDate \|\| new Date\(\)\) >= new Date\(\)\);/g,
"const active = bookings.filter(b => ['PAYMENT_SUCCESS', 'CONFIRMED'].includes(b.bookingStatus) && new Date(b.checkIn || b.startDate || new Date()) <= new Date() && new Date(b.checkOut || b.endDate || new Date()) >= new Date());");

c = c.replace(/const past = bookings\.filter\(b => \['COMPLETED', 'CANCELLED', 'REFUNDED'\]\.includes\(b\.bookingStatus\)\);/g,
"const past = bookings.filter(b => ['COMPLETED', 'CANCELLED', 'REFUNDED', 'EXPIRED', 'WITHDRAWN', 'REJECTED', 'CONFLICTED'].includes(b.bookingStatus) || (['PAYMENT_SUCCESS', 'CONFIRMED'].includes(b.bookingStatus) && new Date(b.checkOut || b.endDate || new Date(2000,0,1)) < new Date()));");

fs.writeFileSync('src/app/(dashboard)/host/reservations/page.tsx', c);
