const fs = require("fs");
let admin = fs.readFileSync("src/app/(dashboard)/admin/page.tsx", "utf8");
admin = admin.replace(/revenue\._sum\.hostPayoutAmount/g, "(revenue._sum?.hostPayoutAmount || 0)");
admin = admin.replace(/revenue\._sum\.platformFeeAmount/g, "(revenue._sum?.platformFeeAmount || 0)");
fs.writeFileSync("src/app/(dashboard)/admin/page.tsx", admin);

let hostDash = fs.readFileSync("src/app/(dashboard)/host/dashboard/page.tsx", "utf8");
hostDash = hostDash.replace(/earnings\._sum\.hostPayoutAmount/g, "(earnings._sum?.hostPayoutAmount || 0)");
fs.writeFileSync("src/app/(dashboard)/host/dashboard/page.tsx", hostDash);

