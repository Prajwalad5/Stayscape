const fs = require("fs");
let seed = fs.readFileSync("prisma/seed.ts", "utf8");

// We can just replace the enum usage with strings
// Enums used: UserRole, PropertyType, PropertyStatus, RoomType, BookingStatus, CancellationPolicy, NotificationType
const regex = /(UserRole|PropertyType|PropertyStatus|RoomType|BookingStatus|CancellationPolicy|NotificationType)\.(\w+)/g;
seed = seed.replace(regex, "\"$2\"");

fs.writeFileSync("prisma/seed.ts", seed);
console.log("Updated seed file");
