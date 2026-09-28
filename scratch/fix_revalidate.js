const fs = require('fs');
let content = fs.readFileSync('src/app/api/v1/users/me/route.ts', 'utf8');

if (!content.includes('revalidatePath')) {
  content = content.replace(/import \{ z \} from 'zod';/, "import { z } from 'zod';\nimport { revalidatePath } from 'next/cache';");
  
  content = content.replace(/return NextResponse\.json\(\{ success: true, data: \{ message: 'Profile updated successfully' \} \}\);/g, "revalidatePath('/', 'layout');\n    return NextResponse.json({ success: true, data: { message: 'Profile updated successfully' } });");
  
  fs.writeFileSync('src/app/api/v1/users/me/route.ts', content);
}
