const fs = require('fs');
let c = fs.readFileSync('src/app/(dashboard)/guest/trips/page.tsx', 'utf8');

c = c.replace(/onClick=\{\(e\) => e\.stopPropagation\(\)\}/g, '');

fs.writeFileSync('src/app/(dashboard)/guest/trips/page.tsx', c);
