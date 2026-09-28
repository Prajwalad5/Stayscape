const fs = require('fs');

let file = 'src/app/admin-portal/role-management/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "if (!freshUser || freshUser.role !== 'ADMIN') {",
  "if (!freshUser || (freshUser.role !== 'ADMIN' && !freshUser.adminRole)) {"
);

fs.writeFileSync(file, content);
