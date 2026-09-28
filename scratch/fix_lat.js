const fs = require('fs');
let file = 'src/app/(public)/properties/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace('latitude: property.lat,', 'latitude: property.latitude,');
content = content.replace('longitude: property.lng,', 'longitude: property.longitude,');
fs.writeFileSync(file, content);
