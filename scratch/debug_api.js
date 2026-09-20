const fs = require('fs');
let c = fs.readFileSync('src/app/api/properties/route.ts', 'utf8');
c = c.replace(/console\.error\('Property create error:', error\);/, "console.error('Property create error:', error);");
c = c.replace(/if \(\!validated\.success\) \{/, "if (!validated.success) {\n      console.error('Validation Error Details:', validated.error.flatten().fieldErrors);");
fs.writeFileSync('src/app/api/properties/route.ts', c);
