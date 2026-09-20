const fs = require('fs');
let c = fs.readFileSync('src/components/property/property-card.tsx', 'utf8');

const oldPricing = `<p className="text-sm">
          <span className="font-semibold">{formatCurrency(property.pricePerNight / 100, property.currency || 'USD')}</span>
          <span className="text-muted-foreground"> / night</span>
        </p>`;
        
const newPricing = `<p className="text-sm">
          <span className="font-semibold">
            {formatCurrency(
              (property.rentalType === 'MONTHLY' || property.rentalType === 'LONG_TERM') ? (property.pricePerMonth / 100) :
              property.rentalType === 'WEEKLY' ? (property.pricePerWeek / 100) :
              (property.pricePerNight / 100), 
              property.currency || 'NPR'
            )}
          </span>
          <span className="text-muted-foreground">
            {property.rentalType === 'MONTHLY' || property.rentalType === 'LONG_TERM' ? ' / month' :
             property.rentalType === 'WEEKLY' ? ' / week' : ' / night'}
          </span>
        </p>`;

c = c.replace(oldPricing, newPricing);
fs.writeFileSync('src/components/property/property-card.tsx', c);
