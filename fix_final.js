const fs = require("fs");
let admin = fs.readFileSync("src/app/(dashboard)/admin/page.tsx", "utf8");
admin = admin.replace(/status: /g, "bookingStatus: ");
fs.writeFileSync("src/app/(dashboard)/admin/page.tsx", admin);

let demo = fs.readFileSync("src/lib/payments/providers/demo.ts", "utf8");
demo = demo.replace(/from .\.\/types.;/, "from \"../types\";");
fs.writeFileSync("src/lib/payments/providers/demo.ts", demo);

