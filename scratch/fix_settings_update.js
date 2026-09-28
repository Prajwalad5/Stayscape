const fs = require('fs');
let content = fs.readFileSync('src/components/profile/settings-form.tsx', 'utf8');

content = content.replace(/await update\(\);/g, "await update({ name: data?.name, image: avatar });");

fs.writeFileSync('src/components/profile/settings-form.tsx', content);
