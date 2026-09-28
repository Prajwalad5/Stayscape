const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src/app/api/v1/admin');
files.forEach(file => {
  if (file.endsWith('route.ts')) {
    const content = fs.readFileSync(file, 'utf8');
    if (!content.includes('adminRole') && !content.includes('PERMISSIONS')) {
      console.log('Missing RBAC check:', file);
    }
  }
});
