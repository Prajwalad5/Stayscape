const fs = require('fs');
let filters = fs.readFileSync('src/components/search/search-filters.tsx', 'utf8');
filters = filters.replace(/<span>\$\{(.*?)\}<\/span>/g, "<span>NPR ${$1}</span>");
fs.writeFileSync('src/components/search/search-filters.tsx', filters);

let listingForm = fs.readFileSync('src/components/host/listing-form.tsx', 'utf8');
listingForm = listingForm.replace(/<SelectItem value="USD">USD \(\$\)<\/SelectItem>/g, "<SelectItem value=\"USD\">USD ($)</SelectItem>\n                  <SelectItem value=\"NPR\">NPR (?)</SelectItem>");
listingForm = listingForm.replace(/defaultValue="USD"/g, 'defaultValue="NPR"');
fs.writeFileSync('src/components/host/listing-form.tsx', listingForm);

let footer = fs.readFileSync('src/components/layout/footer.tsx', 'utf8');
footer = footer.replace(/<span className="text-sm text-muted-foreground">\$ USD<\/span>/g, '<span className="text-sm text-muted-foreground">NPR</span>');
fs.writeFileSync('src/components/layout/footer.tsx', footer);

