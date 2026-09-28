const fs = require('fs');
let content = fs.readFileSync('src/auth.config.ts', 'utf8');

content = content.replace(/if \(trigger === 'update' && session\) \{/g, "if (trigger === 'update' && session) {\n        if (session.name) token.name = session.name;\n        if (session.image) token.picture = session.image;");
fs.writeFileSync('src/auth.config.ts', content);
