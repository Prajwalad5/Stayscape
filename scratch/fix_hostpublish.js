const fs = require('fs');
let content = fs.readFileSync('src/app/(dashboard)/host/listings/host-publish-button.tsx', 'utf8');

content = content.replace(/\$49\.00/g, 'NPR 5000');

fs.writeFileSync('src/app/(dashboard)/host/listings/host-publish-button.tsx', content);
