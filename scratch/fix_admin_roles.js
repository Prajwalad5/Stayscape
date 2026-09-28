const fs = require('fs');

let hookFile = 'src/hooks/use-session.ts';
let hookContent = fs.readFileSync(hookFile, 'utf8');
hookContent = hookContent.replace(
  "return user?.role === 'ADMIN';",
  "return user?.role === 'ADMIN' || !!user?.adminRole;"
);
fs.writeFileSync(hookFile, hookContent);

let authConfigFile = 'src/auth.config.ts';
let authConfigContent = fs.readFileSync(authConfigFile, 'utf8');
authConfigContent = authConfigContent.replace(
  "return isLoggedIn && user?.role === 'ADMIN';",
  "return isLoggedIn && (user?.role === 'ADMIN' || !!user?.adminRole);"
);
fs.writeFileSync(authConfigFile, authConfigContent);
