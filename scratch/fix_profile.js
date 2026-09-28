const fs = require('fs');
let content = fs.readFileSync('src/app/(public)/users/[id]/page.tsx', 'utf8');

// Fix reviewsReceived inside properties
content = content.replace(/reviewsReceived: \{ select: \{ overallRating: true \} \}/g, "reviews: { select: { overallRating: true } }");
content = content.replace(/user\.properties/g, "(user as any).properties");
fs.writeFileSync('src/app/(public)/users/[id]/page.tsx', content);
