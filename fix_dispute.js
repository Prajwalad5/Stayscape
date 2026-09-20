const fs = require("fs");
let admin = fs.readFileSync("src/app/(dashboard)/admin/page.tsx", "utf8");
admin = admin.replace(/prisma\.dispute\.count\(\{ where: \{ bookingStatus: .OPEN. \} \}\)/, "prisma.dispute.count({ where: { status: \"OPEN\" } })");
fs.writeFileSync("src/app/(dashboard)/admin/page.tsx", admin);

