const fs = require('fs');
let c = fs.readFileSync('src/app/admin-portal/bookings/page.tsx', 'utf8');

const regex = /\{\['PENDING_PAYMENT', 'CONFIRMED'\]\.includes\(booking\.bookingStatus\) \? \([\s\S]*?<AdminCancelButton bookingId=\{booking\.id\} \/>[\s\S]*?\) : \([\s\S]*?<span className="text-xs text-muted-foreground">.*?<\/span>[\s\S]*?\)\}/;
const replacement = `{['PENDING_APPROVAL', 'REQUESTED', 'PENDING', 'APPROVED', 'PAYMENT_PENDING', 'PAYMENT_SUCCESS', 'CONFIRMED'].includes(booking.bookingStatus) ? (
                        <div className="flex flex-col items-end gap-2">
                          {['PENDING_APPROVAL', 'REQUESTED', 'PENDING'].includes(booking.bookingStatus) && <AdminApproveButton bookingId={booking.id} />}
                          <AdminCancelButton bookingId={booking.id} />
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}`;
c = c.replace(regex, replacement);

fs.writeFileSync('src/app/admin-portal/bookings/page.tsx', c);
