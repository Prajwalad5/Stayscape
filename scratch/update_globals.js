const fs = require('fs');
let content = fs.readFileSync('src/app/globals.css', 'utf8');

if (!content.includes('overflow-x: hidden')) {
  content = content.replace(/body \{/, `html, body {
  overflow-x: hidden;
  max-width: 100vw;
}
body {`);
  fs.writeFileSync('src/app/globals.css', content);
}
