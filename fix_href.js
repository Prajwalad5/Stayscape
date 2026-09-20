const fs = require("fs");
let p1 = fs.readFileSync("src/app/(public)/destinations/[slug]/page.tsx", "utf8");
p1 = p1.replace(/actionUrl="/g, "actionHref=\"");
fs.writeFileSync("src/app/(public)/destinations/[slug]/page.tsx", p1);

let p2 = fs.readFileSync("src/app/(public)/search/page.tsx", "utf8");
p2 = p2.replace(/actionUrl="/g, "actionHref=\"");
fs.writeFileSync("src/app/(public)/search/page.tsx", p2);
