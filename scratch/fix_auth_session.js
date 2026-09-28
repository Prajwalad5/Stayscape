const fs = require('fs');
let content = fs.readFileSync('src/auth.config.ts', 'utf8');

content = content.replace(/\(session\.user as any\)\.permissions = token\.permissions;/g, 
  "(session.user as any).permissions = token.permissions;\n        if (token.name) (session.user as any).name = token.name;\n        if (token.picture) (session.user as any).image = token.picture;");

fs.writeFileSync('src/auth.config.ts', content);
