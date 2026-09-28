const fs = require('fs');

let navbarFile = 'src/components/layout/navbar.tsx';
let navbarContent = fs.readFileSync(navbarFile, 'utf8');

// The line currently has: <Link href="/admin" className="cursor-pointer">
navbarContent = navbarContent.replace('<Link href="/admin" className="cursor-pointer">', '<Link href="/admin-portal" className="cursor-pointer">');

fs.writeFileSync(navbarFile, navbarContent);
