const fs = require("fs");
let content = fs.readFileSync("src/middleware.ts", "utf8");
content = content.replace(/const res = await nextAuthMiddleware\(req, event\);/g, "const res = await nextAuthMiddleware(req, event) as any;");
fs.writeFileSync("src/middleware.ts", content);

