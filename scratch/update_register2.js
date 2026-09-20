const fs = require('fs');
let c = fs.readFileSync('src/app/api/auth/register/route.ts', 'utf8');

c = c.replace(/import \{ hashEmailForSearch \} from '@\/lib\/crypto';/g, "import { hashEmailForSearch, encryptProfileData } from '@/lib/crypto';");

c = c.replace(/emailSearchHash: hashEmailForSearch\(email\),/g, "emailSearchHash: hashEmailForSearch(email),\n          encryptedEmail: encryptProfileData(email),");

fs.writeFileSync('src/app/api/auth/register/route.ts', c);
