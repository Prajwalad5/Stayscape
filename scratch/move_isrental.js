const fs = require('fs');
let c = fs.readFileSync('src/app/api/bookings/route.ts', 'utf8');

c = c.replace(/const rentalType = property\.rentalType \|\| 'SHORT_TERM';\n    const isRental = rentalType === 'MONTHLY' \|\| rentalType === 'LONG_TERM' \|\| rentalType === 'WEEKLY';/g, '');

c = c.replace(/let checkInDate = checkIn \|\| validated\.data\.startDate;/g, `const rentalType = property.rentalType || 'SHORT_TERM';\n    const isRental = rentalType === 'MONTHLY' || rentalType === 'LONG_TERM' || rentalType === 'WEEKLY';\n\n    let checkInDate = checkIn || validated.data.startDate;`);

fs.writeFileSync('src/app/api/bookings/route.ts', c);
