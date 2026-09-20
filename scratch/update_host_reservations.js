const fs = require('fs');

let content = fs.readFileSync('src/app/(dashboard)/host/reservations/page.tsx', 'utf8');

const replacement = `
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{booking.property.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={booking.guest.image || undefined} />
                      <AvatarFallback className="text-[10px]">{getInitials(booking.guest.name)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{booking.guest.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <CalendarDays className="h-3 w-3" />
                    {booking.rentalType === 'MONTHLY' || booking.rentalType === 'LONG_TERM' ? (
                      <>Move-in: {formatDate(booking.startDate || booking.checkIn || new Date())}</>
                    ) : (
                      <>{booking.checkIn ? formatDate(booking.checkIn) : booking.startDate ? formatDate(booking.startDate) : 'Flexible'} - {booking.checkOut ? formatDate(booking.checkOut) : booking.endDate ? formatDate(booking.endDate) : 'Flexible'}</>
                    )}
                  </p>
                </div>
                <div className="text-right shrink-0 flex flex-col items-end gap-2">
                  <Badge className={statusInfo?.color || ''}>{statusInfo?.label || booking.bookingStatus}</Badge>
                  <div>
                    <p className="text-xs text-muted-foreground text-right">{booking.rentalType === 'MONTHLY' || booking.rentalType === 'LONG_TERM' ? 'Initial Total' : 'Total'}</p>
                    <p className="font-semibold">{formatPrice(booking.totalPrice)}</p>
                  </div>
`;

const regex = /<div className="flex-1">[\s\S]*?<p className="font-semibold">\{formatPrice\(booking\.totalPrice\)\}<\/p>/;
content = content.replace(regex, replacement.trim());

fs.writeFileSync('src/app/(dashboard)/host/reservations/page.tsx', content);
