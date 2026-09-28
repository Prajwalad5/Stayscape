const fs = require('fs');
let file = 'src/components/property/property-card.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  "onClick={handleFavorite}\n          >",
  "onClick={handleFavorite}\n            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}\n          >"
);
fs.writeFileSync(file, content);
