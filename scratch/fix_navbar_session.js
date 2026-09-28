const fs = require('fs');
let content = fs.readFileSync('src/components/profile/settings-form.tsx', 'utf8');

if (!content.includes('useSession')) {
  content = content.replace(/import \{ useRouter \} from "next\/navigation";/, 'import { useRouter } from "next/navigation";\nimport { useSession } from "next-auth/react";');
  content = content.replace(/const router = useRouter\(\);/, 'const router = useRouter();\n  const { update } = useSession();');
  content = content.replace(/router\.refresh\(\);/g, 'await update();\n      router.refresh();');
  fs.writeFileSync('src/components/profile/settings-form.tsx', content);
}
