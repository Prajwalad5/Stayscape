const fs = require('fs');

// Validator
let val = fs.readFileSync('src/lib/validators/property.ts', 'utf8');
val = val.replace(/currency: z\.string\(\)\.default\('USD'\),/g, "currency: z.string().default('NPR'),");
val = val.replace(/currency: z\.string\(\)\.default\('usd'\),/g, "currency: z.string().default('NPR'),");
fs.writeFileSync('src/lib/validators/property.ts', val);

// Listing Form Default Values
let form = fs.readFileSync('src/components/host/listing-form.tsx', 'utf8');
form = form.replace(/currency: 'USD',/g, "currency: 'NPR',");
form = form.replace(/currency: 'usd',/g, "currency: 'NPR',");

// Also add a basic currency selector to the form
if (!form.includes('<Select value={currency} onValueChange={(v) => setValue(\'currency\', v)}>')) {
  // Try to find the currency label or where to inject
  const target = `<div className="space-y-2">
              <Label>Property Type</Label>`;
  const replacement = `<div className="space-y-2">
              <Label>Currency</Label>
              <Select disabled={isLoading} value={currency} onValueChange={(v) => setValue('currency', v)}>
                <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="NPR">Nepalese Rupee (NPR)</SelectItem>
                  <SelectItem value="USD">US Dollar (USD)</SelectItem>
                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Property Type</Label>`;
  
  if(form.includes(target)) {
    form = form.replace(target, replacement);
  }
}
fs.writeFileSync('src/components/host/listing-form.tsx', form);
