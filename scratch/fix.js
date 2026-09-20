const fs = require('fs');
let c = fs.readFileSync('src/app/(public)/properties/[id]/page.tsx', 'utf8');
c = c.replace(/\{\{\/\* Description \*\/\}/g, '{/* Description */}');
fs.writeFileSync('src/app/(public)/properties/[id]/page.tsx', c);
