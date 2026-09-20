const fs = require('fs');
let c = fs.readFileSync('src/components/host/listing-form.tsx', 'utf8');

const regex = /<form onSubmit=\{handleSubmit\(onSubmit\)\} className="space-y-8 max-w-4xl pb-24">/;
c = c.replace(regex, `<form onSubmit={(e) => { e.preventDefault(); console.log("FORM ERRORS:", errors); handleSubmit(onSubmit)(e); }} className="space-y-8 max-w-4xl pb-24">`);

fs.writeFileSync('src/components/host/listing-form.tsx', c);
