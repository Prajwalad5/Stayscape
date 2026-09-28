const fs = require('fs');
let file = 'src/app/layout.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('CookieBanner')) {
  content = content.replace("import { Providers } from '@/components/providers';", "import { Providers } from '@/components/providers';\nimport { CookieBanner } from '@/components/layout/cookie-banner';");
  content = content.replace("<Providers>", "<Providers>\n          <CookieBanner />");
  fs.writeFileSync(file, content);
}
