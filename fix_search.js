const fs = require("fs");
let content = fs.readFileSync("src/app/(public)/search/page.tsx", "utf8");

content = content.replace(/id=\{`property-\$\{property\.id\}`\}/, "");
content = content.replace(/<PropertyCard \n\s*key=\{property\.id\} \n\s*property=\{property as any\} \n\s*\/>/m, "<div id={`property-${property.id}`} key={property.id}><PropertyCard property={property as any} /></div>");

fs.writeFileSync("src/app/(public)/search/page.tsx", content);
