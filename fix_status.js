const fs = require("fs");
let files = [
  "src/app/(dashboard)/guest/trips/page.tsx",
  "src/app/(dashboard)/host/dashboard/page.tsx",
  "src/app/(dashboard)/host/reservations/page.tsx",
  "src/app/api/stripe/webhook/route.ts"
];

for (let file of files) {
  let content = fs.readFileSync(file, "utf8");
  content = content.replace(/b\.status/g, "b.bookingStatus");
  content = content.replace(/booking\.status/g, "booking.bookingStatus");
  content = content.replace(/status:/g, "bookingStatus:");
  // For JSX
  content = content.replace(/status ===/g, "bookingStatus ===");
  fs.writeFileSync(file, content);
}

