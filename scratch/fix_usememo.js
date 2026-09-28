const fs = require('fs');
let file = 'src/components/booking/booking-card.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "}, [isRental, nights, startDate, durationMonths, property]);",
  "}, [isRental, nights, durationMonths, property]);"
);

fs.writeFileSync(file, content);
