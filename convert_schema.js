const fs = require("fs");
let schema = fs.readFileSync("prisma/schema.prisma", "utf8");

schema = schema.replace(/provider\s*=\s*"postgresql"/g, "provider = \"sqlite\"");
schema = schema.replace(/env\("DATABASE_URL"\)/g, "\"file:./dev.db\"");

const enumMatches = [...schema.matchAll(/enum\s+(\w+)\s+\{[\s\S]*?\}/g)];
const enumNames = enumMatches.map(m => m[1]);
schema = schema.replace(/enum\s+\w+\s+\{[\s\S]*?\}/g, "");

enumNames.forEach(name => {
  const regex = new RegExp("(^\\\\s*\\\\w+\\\\s+)" + name + "(\\\\s|\\\\?|$)", "gm");
  schema = schema.replace(regex, "$1String$2");
});

schema = schema.replace(/@db\.\w+/g, "");

fs.writeFileSync("prisma/schema.prisma", schema);
console.log("Converted schema to SQLite");
