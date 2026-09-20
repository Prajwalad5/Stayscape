const fs = require("fs");
let schema = fs.readFileSync("prisma/schema.prisma", "utf8");

const typesToReplace = ["UserRole", "PropertyType", "RoomType", "PropertyStatus", "CancellationPolicy", "BookingStatus", "PaymentStatus", "PayoutStatus", "NotificationType", "DisputeStatus"];

typesToReplace.forEach(t => {
  schema = schema.replace(new RegExp(`\\s+${t}(\\s|\\?)`, "g"), ` String$1`);
});

schema = schema.replace(/@@index\(\[role\]\)/g, "@@index([role(length: 191)])");
// Actually, SQLite doesn`t require length limits but maybe it failed because it thought role was a relation field?
// Wait, if it`s replaced with String, it won`t be a relation.

fs.writeFileSync("prisma/schema.prisma", schema);
console.log("Replaced types");
