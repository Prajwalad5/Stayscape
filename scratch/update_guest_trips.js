const fs = require('fs');

let content = fs.readFileSync('src/app/(dashboard)/guest/trips/page.tsx', 'utf8');

const replacement = `
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-sm flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {booking.rentalType === 'MONTHLY' || booking.rentalType === 'LONG_TERM' ? (
                        <>Move-in: {formatDate(booking.startDate || booking.checkIn || new Date())}</>
                      ) : (
                        <>{booking.checkIn ? formatDate(booking.checkIn) : booking.startDate ? formatDate(booking.startDate) : 'Flexible'} - {booking.checkOut ? formatDate(booking.checkOut) : booking.endDate ? formatDate(booking.endDate) : 'Flexible'}</>
                      )}
                    </p>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground uppercase">{booking.rentalType === 'MONTHLY' || booking.rentalType === 'LONG_TERM' ? 'Initial Total' : 'Total'}</p>
                      <p className="font-semibold">{formatPrice(booking.totalPrice)}</p>
                    </div>
                  </div>
`;

const regex = /<div className="flex items-center justify-between mt-3">[\s\S]*?<p className="font-semibold">\{formatPrice\(booking\.totalPrice\)\}<\/p>[\s\S]*?<\/div>/;
content = content.replace(regex, replacement.trim());

fs.writeFileSync('src/app/(dashboard)/guest/trips/page.tsx', content);
