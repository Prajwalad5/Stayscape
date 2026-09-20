const fs = require('fs');
let c = fs.readFileSync('src/lib/validators/property.ts', 'utf8');

c = c.replace(/pricePerNight: z\.coerce\.number\(\)\.int\(\)\.min\(10, "Minimum price is \$10"\),/, 'pricePerNight: z.coerce.number().int().min(0).default(0),');
c = c.replace(/minNights: z\.coerce\.number\(\)\.int\(\)\.min\(1\)\.default\(1\),/, 'minNights: z.coerce.number().int().min(1).default(1),');

fs.writeFileSync('src/lib/validators/property.ts', c);
