const fs = require("fs");
let content = fs.readFileSync("src/app/api/bookings/route.ts", "utf8");
content = content.replace(/import \{ PLATFORM_FEE_PERCENT \} from .@\/lib\/constants.;\n/, "");
fs.writeFileSync("src/app/api/bookings/route.ts", content);

