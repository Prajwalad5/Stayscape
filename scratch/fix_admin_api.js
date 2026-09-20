const fs = require('fs');
let c = fs.readFileSync('src/app/api/v1/admin/bookings/[id]/approve/route.ts', 'utf8');

c = c.replace(/PERMISSIONS\.BOOKINGS_MANAGE/g, 'PERMISSIONS.BOOKINGS_MODIFY');

fs.writeFileSync('src/app/api/v1/admin/bookings/[id]/approve/route.ts', c);
