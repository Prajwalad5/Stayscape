const fs = require('fs');
let c = fs.readFileSync('src/components/property/property-card.tsx', 'utf8');

c = c.replace(/pricePerNight: number;/g, `pricePerNight: number;\n  pricePerMonth?: number | null;\n  pricePerWeek?: number | null;\n  rentalType?: string | null;`);

fs.writeFileSync('src/components/property/property-card.tsx', c);
