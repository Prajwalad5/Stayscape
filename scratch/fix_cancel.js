const fs = require('fs');
let file = 'src/app/api/v1/bookings/[id]/cancel/route.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace("!['PENDING_PAYMENT', 'CONFIRMED'].includes(booking.bookingStatus)", "!['PENDING_PAYMENT', 'CONFIRMED', 'REQUESTED', 'PENDING', 'PENDING_APPROVAL'].includes(booking.bookingStatus)");
fs.writeFileSync(file, content);
