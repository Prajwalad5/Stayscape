const fs = require('fs');
let content1 = fs.readFileSync('src/app/(public)/users/[id]/page.tsx', 'utf8');
content1 = content1.replace(/\(user as any\)\.properties\.map\(\(property\) => \(/g, "(user as any).properties.map((property: any) => (");
fs.writeFileSync('src/app/(public)/users/[id]/page.tsx', content1);

let content2 = fs.readFileSync('src/app/(dashboard)/host/calendar/page.tsx', 'utf8');
content2 = content2.replace(/onChange="this\.form\.submit\(\)"/g, "onChange={(e) => e.target.form?.submit()}");
fs.writeFileSync('src/app/(dashboard)/host/calendar/page.tsx', content2);
