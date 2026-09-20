const fs = require('fs');
let c = fs.readFileSync('src/auth.ts', 'utf8');

c = `import { hashEmailForSearch } from '@/lib/crypto';\n` + c;

c = c.replace(/OR: \[\s*\{ email: validated\.data\.email \},\s*\{ loginId: validated\.data\.email \}\s*\]/g, `OR: [
              { email: validated.data.email },
              { emailSearchHash: hashEmailForSearch(validated.data.email) },
              { loginId: validated.data.email }
            ]`);

fs.writeFileSync('src/auth.ts', c);
