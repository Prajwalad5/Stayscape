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

const files = walk('src/app');
files.forEach(file => {
  if (file.endsWith('page.tsx')) {
    const content = fs.readFileSync(file, 'utf8');
    const matches = content.match(/<h1/g);
    if (matches && matches.length > 1) {
      console.log('Duplicate H1s:', file, matches.length);
    }
    if (!matches) {
      console.log('No H1:', file);
    }
  }
});
