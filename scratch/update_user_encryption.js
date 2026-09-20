const fs = require('fs');
let c = fs.readFileSync('prisma/schema.prisma', 'utf8');

c = c.replace(/emailSearchHash\s+String\?\s+@unique/g, 'emailSearchHash         String?                   @unique\n  encryptedEmail          String?\n  encryptedBio            String?');

fs.writeFileSync('prisma/schema.prisma', c);
