const fs = require('fs');
let file = 'src/components/search/search-bar.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace('<label className="block text-xs font-semibold text-foreground">Where</label>', '<label htmlFor="search-where" className="block text-xs font-semibold text-foreground">Where</label>');
content = content.replace('type="text"\n            placeholder="Search destinations"', 'id="search-where"\n            type="text"\n            placeholder="Search destinations"');

content = content.replace('<label className="block text-xs font-semibold text-foreground">Check in</label>', '<label htmlFor="search-checkin" className="block text-xs font-semibold text-foreground">Check in</label>');
content = content.replace('type="date"\n            value={checkIn}', 'id="search-checkin"\n            type="date"\n            value={checkIn}');

content = content.replace('<label className="block text-xs font-semibold text-foreground">Check out</label>', '<label htmlFor="search-checkout" className="block text-xs font-semibold text-foreground">Check out</label>');
content = content.replace('type="date"\n            value={checkOut}', 'id="search-checkout"\n            type="date"\n            value={checkOut}');

content = content.replace('<label className="block text-xs font-semibold text-foreground">Guests</label>', '<label htmlFor="search-guests" className="block text-xs font-semibold text-foreground">Guests</label>');
content = content.replace('type="number"\n            placeholder="Add guests"', 'id="search-guests"\n            type="number"\n            placeholder="Add guests"');

fs.writeFileSync(file, content);
