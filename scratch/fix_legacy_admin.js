const fs = require('fs');
const file = 'src/lib/auth/permissions.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "export function hasPermission(user: any, permission: string): boolean {\n  if (!user || !user.adminRole) return false;",
  "export function hasPermission(user: any, permission: string): boolean {\n  if (!user) return false;\n  if (user.role === 'ADMIN' && !user.adminRole) return true; // Legacy ADMIN\n  if (!user.adminRole) return false;"
);

content = content.replace(
  "export function isAdmin(user: any): boolean {\n  return !!user?.adminRole;",
  "export function isAdmin(user: any): boolean {\n  return user?.role === 'ADMIN' || !!user?.adminRole;"
);

fs.writeFileSync(file, content);
