const fs = require('fs');
let file = 'src/app/(public)/properties/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');
if (!content.includes('import { cache } from \'react\';')) {
  content = content.replace("import { notFound } from 'next/navigation';", "import { notFound } from 'next/navigation';\nimport { cache } from 'react';");
}
content = content.replace('async function getProperty(id: string) {', 'const getProperty = cache(async (id: string) => {');
content = content.replace(
  '  } catch {\n    return null;\n  }\n}',
  '  } catch {\n    return null;\n  }\n});'
);
fs.writeFileSync(file, content);
