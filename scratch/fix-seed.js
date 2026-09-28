const fs = require('fs');
let seed = fs.readFileSync('prisma/seed.ts', 'utf8');

//     const property = await prisma.property.create({
//       data: {
//         ...data,
seed = seed.replace(/const property = await prisma.property.create\(\{\n\s*data: \{\n\s*\.\.\.data,/g, 'const property = await prisma.property.create({\n      data: {\n        ...(data as any),');

fs.writeFileSync('prisma/seed.ts', seed);
