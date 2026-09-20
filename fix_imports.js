const fs = require("fs");
let content = fs.readFileSync("src/app/admin-portal/(auth)/login/page.tsx", "utf8");
content = content.replace(
  "import { ShieldAlert } from \"lucide-react\";\nimport { useState } from \"react\";",
  "import { Button } from \"@/components/ui/button\";\nimport { Input } from \"@/components/ui/input\";\nimport { Label } from \"@/components/ui/label\";\nimport { ShieldAlert } from \"lucide-react\";\nimport { useState } from \"react\";"
);
fs.writeFileSync("src/app/admin-portal/(auth)/login/page.tsx", content);

