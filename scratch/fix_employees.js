const fs = require('fs');

const files = [
  'src/app/api/v1/admin/employees/route.ts',
  'src/app/api/v1/admin/employees/[id]/route.ts',
  'src/app/api/v1/admin/employees/[id]/reset-password/route.ts'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /sessionUser\.role !== 'ADMIN'/g,
    "(sessionUser.role !== 'ADMIN' && !sessionUser.adminRole)"
  );
  fs.writeFileSync(file, content);
}
