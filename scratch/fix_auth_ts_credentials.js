const fs = require('fs');
let file = 'src/auth.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  "if (credentials?.email && isRateLimited(credentials.email)) throw new Error('Too many login attempts');",
  "if (typeof credentials?.email === 'string' && isRateLimited(credentials.email)) throw new Error('Too many login attempts');"
);
fs.writeFileSync(file, content);
