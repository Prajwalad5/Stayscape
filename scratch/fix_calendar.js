const fs = require('fs');

const file = 'src/app/(dashboard)/host/calendar/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Insert import at the top
content = content.replace("import { format } from 'date-fns';", "import { format } from 'date-fns';\nimport { PropertySelector } from './property-selector';");

// Replace the form section
const formRegex = /<form className="flex">[\s\S]*?<\/form>/;
content = content.replace(formRegex, `<PropertySelector properties={properties} selectedId={selectedPropertyId} />`);

fs.writeFileSync(file, content);
