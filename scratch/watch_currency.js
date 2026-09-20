const fs = require('fs');
let c = fs.readFileSync('src/components/host/listing-form.tsx', 'utf8');

c = c.replace(/const propertyType = watch\('propertyType'\);/, "const propertyType = watch('propertyType');\n  const currency = watch('currency');");
fs.writeFileSync('src/components/host/listing-form.tsx', c);
