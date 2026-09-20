const fs = require("fs");
let schema = fs.readFileSync("prisma/schema.prisma", "utf8");

schema = schema.replace(/@default\(USER\)/g, `@default("USER")`);
schema = schema.replace(/@default\(ENTIRE_PLACE\)/g, `@default("ENTIRE_PLACE")`);
schema = schema.replace(/@default\(DRAFT\)/g, `@default("DRAFT")`);
schema = schema.replace(/@default\(FLEXIBLE\)/g, `@default("FLEXIBLE")`);
schema = schema.replace(/@default\(PENDING\)/g, `@default("PENDING")`);
schema = schema.replace(/@default\(OPEN\)/g, `@default("OPEN")`);

fs.writeFileSync("prisma/schema.prisma", schema);
console.log("Replaced defaults");
