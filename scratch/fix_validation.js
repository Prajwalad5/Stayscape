const fs = require('fs');
let content = fs.readFileSync('src/lib/validators/index.ts', 'utf8');

// Fix Booking Schema to allow empty checkIn/checkOut for monthly rentals
content = content.replace(/checkIn: z\.coerce\.date\(\),/g, "checkIn: z.coerce.date().optional(),");
content = content.replace(/checkOut: z\.coerce\.date\(\),/g, "checkOut: z.coerce.date().optional(),");
content = content.replace(/\.refine\(\(d\) => d\.checkOut > d\.checkIn, \{ message: 'Check-out must be after check-in', path: \['checkOut'\] \}\);/g, 
".refine((d) => (!d.checkOut || !d.checkIn) || d.checkOut > d.checkIn, { message: 'Check-out must be after check-in', path: ['checkOut'] });");

fs.writeFileSync('src/lib/validators/index.ts', content);
