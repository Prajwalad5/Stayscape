const fs = require("fs");
let content = fs.readFileSync("src/app/(public)/properties/[id]/page.tsx", "utf8");

content = content.replace(/pricePerNight=\{property\.pricePerNight\}/, "pricePerNight={property.pricePerNight}\n              currency={property.currency}");

fs.writeFileSync("src/app/(public)/properties/[id]/page.tsx", content);
