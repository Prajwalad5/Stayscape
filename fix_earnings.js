const fs = require("fs");
let earnings = fs.readFileSync("src/app/(dashboard)/host/earnings/page.tsx", "utf8");
earnings = earnings.replace(/status: \{ in:/g, "bookingStatus: { in:");
earnings = earnings.replace(/totalEarnings\._sum\.hostPayoutAmount/g, "(totalEarnings._sum?.hostPayoutAmount || 0)");
earnings = earnings.replace(/thisMonthEarnings\._sum\.hostPayoutAmount/g, "(thisMonthEarnings._sum?.hostPayoutAmount || 0)");
earnings = earnings.replace(/lastMonthEarnings\._sum\.hostPayoutAmount/g, "(lastMonthEarnings._sum?.hostPayoutAmount || 0)");
fs.writeFileSync("src/app/(dashboard)/host/earnings/page.tsx", earnings);

