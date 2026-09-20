const fs = require('fs');
let c = fs.readFileSync('src/app/api/auth/register/route.ts', 'utf8');

if (!c.includes('hashEmailForSearch')) {
  c = `import { hashEmailForSearch } from '@/lib/crypto';\n` + c;
  
  c = c.replace(/data: \{\s*name,\s*email,\s*passwordHash,\s*\}/g, `data: {
          name,
          email,
          emailSearchHash: hashEmailForSearch(email),
          passwordHash,
        }`);
        
  fs.writeFileSync('src/app/api/auth/register/route.ts', c);
}
