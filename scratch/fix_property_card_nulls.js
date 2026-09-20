const fs = require('fs');
let c = fs.readFileSync('src/components/property/property-card.tsx', 'utf8');

c = c.replace(/\(property\.pricePerMonth \/ 100\)/g, '((property.pricePerMonth || 0) / 100)');
c = c.replace(/\(property\.pricePerWeek \/ 100\)/g, '((property.pricePerWeek || 0) / 100)');
c = c.replace(/\(property\.pricePerNight \/ 100\)/g, '((property.pricePerNight || 0) / 100)');

fs.writeFileSync('src/components/property/property-card.tsx', c);
