const fs = require("fs");
let content = fs.readFileSync("src/auth.config.ts", "utf8");
content = content.replace("const user = auth?.user as any;", "const user = auth?.user as any;\nconsole.log(\"AUTHORIZED CHECK: user=\", JSON.stringify(user));");
fs.writeFileSync("src/auth.config.ts", content);

