const fs = require('fs');
let content = fs.readFileSync('src/lib/utils.ts', 'utf8');

content = content.replace(/currency: 'USD',/g, "currency: 'NPR',");
content = content.replace(/currency: string = 'USD'/g, "currency: string = 'NPR'");
content = content.replace(/return \`\\$\$\{amount\}\`;/g, "return `NPR ${amount}`;");

fs.writeFileSync('src/lib/utils.ts', content);
