const fs = require('fs');
let file = 'src/app/api/v1/auth/forgot-password/route.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/rateLimit\([^,]+, 3, 15 \* 60 \* 1000\)/, "rateLimit('forgot_' + ip, 3, 15 * 60 * 1000)");
fs.writeFileSync(file, content);
