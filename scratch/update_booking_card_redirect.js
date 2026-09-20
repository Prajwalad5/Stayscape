const fs = require('fs');
let c = fs.readFileSync('src/components/booking/booking-card.tsx', 'utf8');

c = c.replace(/toast\.success\(isRental \? 'Rental request created!' : 'Booking created!'\);\s*router\.push\(\`\/book\/\$\{data\.data\.id\}\`\);/, `toast.success(isRental ? 'Rental request created!' : 'Booking created!');\n      if (['PENDING_APPROVAL', 'REQUESTED', 'PENDING'].includes(data.data.bookingStatus)) {\n        router.push(\`/book/\${data.data.id}/success\`);\n      } else {\n        router.push(\`/book/\${data.data.id}\`);\n      }`);

fs.writeFileSync('src/components/booking/booking-card.tsx', c);
