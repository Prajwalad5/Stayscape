const fs = require('fs');
let c = fs.readFileSync('src/app/api/bookings/route.ts', 'utf8');

c = c.replace(/if \(property\.requiresCheckIn && !checkInDate\) \{[\s\S]*?status: 400 \}\);\s*\}/, 
`if (property.requiresCheckIn && !checkInDate && !isRental) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Check-in date is required for this property' } }, { status: 400 });
    }`);
    
c = c.replace(/if \(property\.requiresCheckOut && !checkOutDate\) \{[\s\S]*?status: 400 \}\);\s*\}/, 
`if (property.requiresCheckOut && !checkOutDate && !isRental) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Check-out date is required for this property' } }, { status: 400 });
    }`);

fs.writeFileSync('src/app/api/bookings/route.ts', c);
