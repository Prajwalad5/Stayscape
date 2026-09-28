const fs = require('fs');
let content = fs.readFileSync('src/auth.ts', 'utf8');

if (!content.includes('rateLimitStore')) {
  let rlCode = `
const rateLimitStore = new Map();
function isRateLimited(email) {
  const now = Date.now();
  let entry = rateLimitStore.get(email);
  if (!entry || entry.resetAt <= now) {
    rateLimitStore.set(email, { count: 1, resetAt: now + 15 * 60000 });
    return false;
  }
  entry.count++;
  if (entry.count > 10) return true;
  return false;
}
`;
  content = content.replace("export const { handlers", rlCode + "\nexport const { handlers");
  content = content.replace("const validated = loginSchema.safeParse(credentials);", "if (credentials?.email && isRateLimited(credentials.email)) throw new Error('Too many login attempts');\n        const validated = loginSchema.safeParse(credentials);");
  fs.writeFileSync('src/auth.ts', content);
}
