const fs = require('fs');

const fixFile = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/rateLimit\([\s\S]*?, 5, 15 \* 60 \* 1000\)/g, "rateLimit('register_' + ip, 5, 15 * 60 * 1000)");
  content = content.replace(/rateLimit\([\s\S]*?, 3, 15 \* 60 \* 1000\)/g, "rateLimit('reset_' + ip, 3, 15 * 60 * 1000)");
  fs.writeFileSync(file, content);
};

fixFile('src/app/api/v1/auth/register/route.ts');
fixFile('src/app/api/v1/auth/reset-password/route.ts');
