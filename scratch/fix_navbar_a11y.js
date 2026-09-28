const fs = require('fs');
let file = 'src/components/layout/navbar.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  '<Button\n                variant="outline"\n                className="flex items-center gap-2 rounded-full px-2 py-1 h-auto"\n              >',
  '<Button\n                variant="outline"\n                className="flex items-center gap-2 rounded-full px-2 py-1 h-auto"\n                aria-label="User menu"\n              >'
);
fs.writeFileSync(file, content);
