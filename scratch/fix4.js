const fs = require('fs');
let c = fs.readFileSync('src/components/layout/navbar.tsx', 'utf8');
c = c.replace(/currentUser\?\.id/g, 'user?.id');
fs.writeFileSync('src/components/layout/navbar.tsx', c);
