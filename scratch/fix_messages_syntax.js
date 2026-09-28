const fs = require('fs');

// Fix src/app/api/v1/messages/route.ts
let file1 = 'src/app/api/v1/messages/route.ts';
let content1 = fs.readFileSync(file1, 'utf8');
content1 = content1.replace("import { sanitizeHtml } from '@/lib/security';", "");
if (!content1.includes("import { sanitizeHtml } from '@/lib/security';")) {
  content1 = "import { sanitizeHtml } from '@/lib/security';\n" + content1;
}
fs.writeFileSync(file1, content1);

// Fix src/app/api/v1/messages/[id]/route.ts
let file2 = 'src/app/api/v1/messages/[id]/route.ts';
let content2 = fs.readFileSync(file2, 'utf8');
content2 = content2.replace("const { content: safeContent, messageType, attachmentUrl } = body;\n      const safeContent = sanitizeHtml(content);", "const { content, messageType, attachmentUrl } = body;\n      const safeContent = sanitizeHtml(content);");
// also remove inline import
content2 = content2.replace("import { sanitizeHtml } from '@/lib/security';", "");
if (!content2.includes("import { sanitizeHtml } from '@/lib/security';")) {
  content2 = "import { sanitizeHtml } from '@/lib/security';\n" + content2;
}
fs.writeFileSync(file2, content2);
