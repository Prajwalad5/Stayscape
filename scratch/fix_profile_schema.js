const fs = require('fs');
let content = fs.readFileSync('src/lib/validators/index.ts', 'utf8');

content = content.replace(/export const updateProfileSchema = z\.object\(\{/, "export const updateProfileSchema = z.object({\n  name: z.string().max(100).optional(),\n  image: z.string().url().optional(),");

fs.writeFileSync('src/lib/validators/index.ts', content);
