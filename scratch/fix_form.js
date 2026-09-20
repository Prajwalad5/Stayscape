const fs = require('fs');
let c = fs.readFileSync('src/components/host/listing-form.tsx', 'utf8');

c = c.replace(/<Input type="number" \{\.\.\.register\('pricePerMonth'\)\} disabled=\{isLoading\} min=\{0\} \/>/g, '<Input type="number" {...register(\'pricePerMonth\')} disabled={isLoading} min={2000} />');

fs.writeFileSync('src/components/host/listing-form.tsx', c);
