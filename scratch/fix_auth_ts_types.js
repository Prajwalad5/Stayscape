const fs = require('fs');
let file = 'src/auth.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace("function isRateLimited(email) {", "function isRateLimited(email: string) {");
fs.writeFileSync(file, content);
