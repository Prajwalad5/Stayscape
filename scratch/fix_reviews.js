const fs = require('fs');
let file1 = 'src/app/api/v1/bookings/[id]/reviews/route.ts';
if (fs.existsSync(file1)) {
  let content1 = fs.readFileSync(file1, 'utf8');
  if (!content1.includes('sanitizeHtml')) {
    content1 = content1.replace("import { auth } from '@/auth';", "import { auth } from '@/auth';\nimport { sanitizeHtml } from '@/lib/security';");
    content1 = content1.replace("const { rating, comment", "const safeComment = sanitizeHtml(body.comment);\n    const { rating, comment");
    content1 = content1.replace(/comment: comment,/g, "comment: safeComment,");
    fs.writeFileSync(file1, content1);
  }
}
