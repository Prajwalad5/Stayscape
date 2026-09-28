const fs = require('fs');

function replaceEntities(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/'/g, "&apos;"); // This is too aggressive. Let's do it manually or more carefully.
}

