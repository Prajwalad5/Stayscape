const fs = require('fs');

let content = fs.readFileSync('src/app/(public)/properties/[id]/page.tsx', 'utf8');

const replacement = `
          {/* Description */}
          <div>
            <h3 className="mb-3 text-lg font-semibold">About this place</h3>
            <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
              {property.description}
            </p>
          </div>

          <Separator />

          {/* Rental Information */}
          {(property.rentalType === 'MONTHLY' || property.rentalType === 'LONG_TERM' || property.rentalType === 'WEEKLY') && (
            <>
              <div>
                <h3 className="mb-3 text-lg font-semibold">Rental Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Monthly Rent</p>
                    <p className="font-medium">{formatPrice(property.pricePerMonth || 0)}/month</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Security Deposit</p>
                    <p className="font-medium">{formatPrice(property.securityDeposit || 0)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Advance Required</p>
                    <p className="font-medium">
                      {property.advanceRequired 
                        ? (property.advanceType === 'MONTHS' ? \`\${property.advanceAmount} Month(s)\` : formatPrice(property.advanceAmount || 0)) 
                        : 'No'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Minimum Rental Period</p>
                    <p className="font-medium">{property.minNights > 1 ? (property.minNights >= 30 ? Math.round(property.minNights / 30) + ' Months' : property.minNights + ' Nights') : 'None'}</p>
                  </div>
                </div>

                <h4 className="mt-4 mb-2 font-medium">Utilities & Additional Charges</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Electricity</p>
                    <p className="font-medium">
                      {property.electricityBillingType === 'INCLUDED' ? 'Included' : 
                       property.electricityBillingType === 'SEPARATE_METER' ? 'Separate Meter (Paid by Renter)' : 
                       property.electricityCharge ? formatPrice(property.electricityCharge) + '/month' : 'Not Included'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Water</p>
                    <p className="font-medium">
                      {property.waterBillingType === 'INCLUDED' ? 'Included' : 
                       property.waterCharge ? formatPrice(property.waterCharge) + '/month' : 'Not Included'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Internet</p>
                    <p className="font-medium">
                      {property.internetBillingType === 'INCLUDED' ? 'Included' : 
                       property.internetCharge ? formatPrice(property.internetCharge) + '/month' : 'Not Included'}
                    </p>
                  </div>
                  {property.maintenanceCharge > 0 && (
                    <div>
                      <p className="text-muted-foreground">Maintenance</p>
                      <p className="font-medium">{formatPrice(property.maintenanceCharge)}/month</p>
                    </div>
                  )}
                  {property.parkingCharge > 0 && (
                    <div>
                      <p className="text-muted-foreground">Parking</p>
                      <p className="font-medium">{formatPrice(property.parkingCharge)}/month</p>
                    </div>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Amenities */}
`;

const regex = /\/\*\s*Description\s*\*\/[\s\S]*?\/\*\s*Amenities\s*\*\//;
content = content.replace(regex, replacement.trim());

fs.writeFileSync('src/app/(public)/properties/[id]/page.tsx', content);
