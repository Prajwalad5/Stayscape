const fs = require('fs');

let content = fs.readFileSync('src/app/(public)/properties/[id]/page.tsx', 'utf8');

const capacityReplacement = `
              <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                {(property.rentalType === 'MONTHLY' || property.rentalType === 'LONG_TERM') ? (
                  <>
                    {property.totalRooms && <span className="flex items-center gap-1"><Home className="h-4 w-4" /> {property.totalRooms} rooms</span>}
                    <span className="flex items-center gap-1"><BedDouble className="h-4 w-4" /> {property.bedrooms} bedrooms</span>
                    <span className="flex items-center gap-1"><Bath className="h-4 w-4" /> {property.bathrooms} baths</span>
                    {(property.kitchens || 0) > 0 && <span className="flex items-center gap-1"><Home className="h-4 w-4" /> {property.kitchens} kitchens</span>}
                    {(property.livingRooms || 0) > 0 && <span className="flex items-center gap-1"><Home className="h-4 w-4" /> {property.livingRooms} living</span>}
                  </>
                ) : (
                  <>
                    <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {property.maxGuests} guests</span>
                    <span className="flex items-center gap-1"><BedDouble className="h-4 w-4" /> {property.bedrooms} bedrooms</span>
                    <span className="flex items-center gap-1"><BedDouble className="h-4 w-4" /> {property.beds} beds</span>
                    <span className="flex items-center gap-1"><Bath className="h-4 w-4" /> {property.bathrooms} baths</span>
                  </>
                )}
              </div>
`;

const capacityRegex = /<div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">[\s\S]*?<\/div>/;
content = content.replace(capacityRegex, capacityReplacement.trim());

fs.writeFileSync('src/app/(public)/properties/[id]/page.tsx', content);
