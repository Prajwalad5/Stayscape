const fs = require('fs');
let content = fs.readFileSync('src/components/profile/settings-form.tsx', 'utf8');

// The first one in handleImageUpload:
// await update({ name: data?.name, image: avatar });
// But here data is upload response, so data.url is the image.
content = content.replace(/await update\(\{ name: data\?\.name, image: avatar \}\);/, "await update({ image: data.url });");

fs.writeFileSync('src/components/profile/settings-form.tsx', content);
