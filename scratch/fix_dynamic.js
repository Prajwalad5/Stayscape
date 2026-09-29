const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (file.endsWith('route.ts') || file.endsWith('route.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (!content.includes("export const dynamic = 'force-dynamic'")) {
        content = "export const dynamic = 'force-dynamic';\n" + content;
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Fixed', fullPath);
      }
    }
  }
}

processDir(path.join(__dirname, '../src/app/api'));
