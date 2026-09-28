const fs = require('fs');

function replaceEntities(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/\{user.name\}'s/g, "{user.name}&apos;s");
  content = content.replace(/we'll/g, "we&apos;ll");
  fs.writeFileSync(filePath, content);
}

const files = [
  'src/app/(public)/users/[id]/page.tsx',
  'src/app/admin-portal/(auth)/forgot-password/page.tsx'
];

files.forEach(replaceEntities);
