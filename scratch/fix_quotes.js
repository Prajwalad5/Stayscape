const fs = require('fs');

function fixUnescaped(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/host's/g, "host&apos;s");
  content = content.replace(/app's/g, "app&apos;s");
  content = content.replace(/StayScape's/g, "StayScape&apos;s");
  content = content.replace(/user's/g, "user&apos;s");
  content = content.replace(/platform's/g, "platform&apos;s");
  content = content.replace(/property's/g, "property&apos;s");
  content = content.replace(/guest's/g, "guest&apos;s");
  content = content.replace(/we're/gi, "we&apos;re");
  content = content.replace(/let's/gi, "let&apos;s");
  content = content.replace(/that's/gi, "that&apos;s");
  fs.writeFileSync(filePath, content);
}

const files = [
  'src/app/(public)/book/[bookingId]/checkout-client.tsx',
  'src/app/(public)/privacy/page.tsx',
  'src/app/(public)/properties/[id]/page.tsx',
  'src/app/(public)/refund-policy/page.tsx',
  'src/app/(public)/users/[id]/page.tsx',
  'src/app/admin-portal/(auth)/forgot-password/page.tsx'
];

files.forEach(fixUnescaped);
