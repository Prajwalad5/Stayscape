const fs = require('fs');
let c = fs.readFileSync('src/app/admin-portal/bookings/page.tsx', 'utf8');

if (!c.includes('import { AdminApproveButton }')) {
  c = c.replace(/import \{ AdminCancelButton \} from '\.\/admin-cancel-button';/, 
    "import { AdminCancelButton } from './admin-cancel-button';\nimport { AdminApproveButton } from './admin-approve-button';");
    
  const actionsRegex = /\{booking\.bookingStatus === 'CONFIRMED' \? \([\s\S]*?<AdminCancelButton bookingId=\{booking\.id\} \/>[\s\S]*?\) : \([\s\S]*?<span className="text-xs text-muted-foreground">—<\/span>[\s\S]*?\)\}/;
  // Wait, the current logic is:
  // {['PENDING_PAYMENT', 'CONFIRMED'].includes(booking.bookingStatus) ? (
  //   <AdminCancelButton bookingId={booking.id} />
  // ) : (
  //   <span className="text-xs text-muted-foreground">—</span>
  // )}
  
  const oldActionsRegex = /\{\['PENDING_PAYMENT', 'CONFIRMED'\]\.includes\(booking\.bookingStatus\) \? \([\s\S]*?<AdminCancelButton bookingId=\{booking\.id\} \/>[\s\S]*?\) : \([\s\S]*?<span className="text-xs text-muted-foreground">—<\/span>[\s\S]*?\)\}/;
  
  const newActions = `{['PENDING', 'PENDING_PAYMENT', 'CONFIRMED'].includes(booking.bookingStatus) ? (
                        <div className="flex flex-col items-end">
                          {booking.bookingStatus === 'PENDING' && <AdminApproveButton bookingId={booking.id} />}
                          <AdminCancelButton bookingId={booking.id} />
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}`;
                      
  c = c.replace(oldActionsRegex, newActions);
  fs.writeFileSync('src/app/admin-portal/bookings/page.tsx', c);
}
