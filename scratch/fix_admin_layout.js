const fs = require('fs');
const file = 'src/app/admin-portal/layout.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "const isSuperAdmin = user?.adminRole === 'SUPER_ADMIN';",
  "const isSuperAdmin = user?.adminRole === 'SUPER_ADMIN' || user?.role === 'ADMIN';"
);

fs.writeFileSync(file, content);
