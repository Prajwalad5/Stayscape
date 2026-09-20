const fs = require('fs');
let c = fs.readFileSync('src/app/(public)/properties/[id]/page.tsx', 'utf8');
c = c.replace(/\{\/\* Amenities \*\/\}\}/g, '{/* Amenities */}');
fs.writeFileSync('src/app/(public)/properties/[id]/page.tsx', c);
