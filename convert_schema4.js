const fs = require("fs");
let schema = fs.readFileSync("prisma/schema.prisma", "utf8");

schema = schema.replace(/@@index\(\[role\(length: 191\)\]\)/g, "@@index([role])");
schema = schema.replace(/bookingIds\s+String\[\]/g, "bookingIds String?");

fs.writeFileSync("prisma/schema.prisma", schema);
console.log("Fixed last errors");
