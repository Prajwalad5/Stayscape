const fs = require('fs');
let file1 = 'src/app/api/v1/messages/route.ts';
let content1 = fs.readFileSync(file1, 'utf8');
if (!content1.includes('sanitizeHtml')) {
  content1 = content1.replace("import { auth } from '@/auth';", "import { auth } from '@/auth';\nimport { sanitizeHtml } from '@/lib/security';");
  content1 = content1.replace("const { participantId, listingId, bookingId, message } = body;", "const { participantId, listingId, bookingId, message } = body;\n      const safeMessage = sanitizeHtml(message);");
  content1 = content1.replace(/content: message,/g, "content: safeMessage,");
  fs.writeFileSync(file1, content1);
}

let file2 = 'src/app/api/v1/messages/[id]/route.ts';
let content2 = fs.readFileSync(file2, 'utf8');
if (!content2.includes('sanitizeHtml')) {
  content2 = content2.replace("import { auth } from '@/auth';", "import { auth } from '@/auth';\nimport { sanitizeHtml } from '@/lib/security';");
  content2 = content2.replace("const { content, messageType, attachmentUrl } = body;", "const { content, messageType, attachmentUrl } = body;\n      const safeContent = sanitizeHtml(content);");
  content2 = content2.replace(/content,/g, "content: safeContent,");
  fs.writeFileSync(file2, content2);
}
