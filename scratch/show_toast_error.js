const fs = require('fs');
let c = fs.readFileSync('src/components/host/listing-form.tsx', 'utf8');

c = c.replace(/toast\.error\(result\.error\?\.message \|\| 'Something went wrong'\);/g, 
  "toast.error(result.error?.message || 'Something went wrong');\n        if (result.error?.details) toast.error(JSON.stringify(result.error.details).substring(0, 200));");

fs.writeFileSync('src/components/host/listing-form.tsx', c);
