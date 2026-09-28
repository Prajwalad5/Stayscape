const fs = require('fs');
let content = fs.readFileSync('src/components/profile/settings-form.tsx', 'utf8');

content = content.replace(/body: JSON\.stringify\(\{ profilePhoto: data\.url \}\)/g, "body: JSON.stringify({ profilePhoto: data.url, image: data.url })");
content = content.replace(/body: JSON\.stringify\(\{ \.\.\.data, profilePhoto: avatar \}\)/g, "body: JSON.stringify({ ...data, profilePhoto: avatar, image: avatar })");

fs.writeFileSync('src/components/profile/settings-form.tsx', content);
