const fs = require("fs");
let admin = fs.readFileSync("src/app/(dashboard)/admin/page.tsx", "utf8");
admin = admin.replace(/revenue\._sum\.totalPrice/g, "(revenue._sum?.totalPrice)");
admin = admin.replace(/revenue\._sum\.serviceFee/g, "(revenue._sum?.serviceFee)");
admin = admin.replace(/status: .COMPLETED./g, "bookingStatus: \"COMPLETED\"");
fs.writeFileSync("src/app/(dashboard)/admin/page.tsx", admin);

let earnings = fs.readFileSync("src/app/(dashboard)/host/earnings/page.tsx", "utf8");
// the earnings page uses old Booking fields. But I completely rewrote it in my plan? 
// No, I did not write it out in code! I only planned it! Let me check the file content of earnings/page.tsx

