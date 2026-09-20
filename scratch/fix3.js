const fs = require('fs');

// Fix properties/[id]/page.tsx
let c = fs.readFileSync('src/app/(public)/properties/[id]/page.tsx', 'utf8');
c = c.replace(/\{formatPrice\(property\.maintenanceCharge\)\}/g, '{formatPrice(property.maintenanceCharge || 0)}');
c = c.replace(/\{property\.maintenanceCharge > 0/g, '{(property.maintenanceCharge || 0) > 0');
c = c.replace(/\{formatPrice\(property\.parkingCharge\)\}/g, '{formatPrice(property.parkingCharge || 0)}');
c = c.replace(/\{property\.parkingCharge > 0/g, '{(property.parkingCharge || 0) > 0');
fs.writeFileSync('src/app/(public)/properties/[id]/page.tsx', c);

// Fix booking-card.tsx
let d = fs.readFileSync('src/components/booking/booking-card.tsx', 'utf8');
d = d.replace(/pricing\.initialRent/g, '(pricing.initialRent || 0)');
d = d.replace(/pricing\.advance/g, '(pricing.advance || 0)');
d = d.replace(/pricing\.subtotal/g, '(pricing.subtotal || 0)');
d = d.replace(/pricing\.serviceFee/g, '(pricing.serviceFee || 0)');
fs.writeFileSync('src/components/booking/booking-card.tsx', d);
