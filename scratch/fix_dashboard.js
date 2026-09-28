const fs = require('fs');

let file = 'src/app/admin-portal/dashboard/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "if (!user || user.role !== 'ADMIN') redirect('/login');",
  "if (!user || (user.role !== 'ADMIN' && !user.adminRole)) redirect('/login');"
);

fs.writeFileSync(file, content);
