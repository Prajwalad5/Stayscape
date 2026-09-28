const fs = require('fs');
let file = 'src/app/(public)/book/[bookingId]/checkout-client.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace("<span>Total (USD)</span>", "<span>Total ({booking.currency?.toUpperCase() || 'NPR'})</span>");
fs.writeFileSync(file, content);
