const fs = require('fs');

let content = fs.readFileSync('src/app/api/bookings/route.ts', 'utf8');

const replacement = `
    let nights = property.minNights || 1;
    const body = await request.json(); // ensure we have body for durationMonths
    
    if (checkInDate && checkOutDate) {
      nights = Math.max(1, Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));
    } else {
      // Create flexible default dates
      checkInDate = checkInDate || new Date();
      
      const isRental = property.rentalType === 'MONTHLY' || property.rentalType === 'LONG_TERM' || property.rentalType === 'WEEKLY';
      if (isRental && body.durationMonths) {
          const end = new Date(checkInDate);
          if (property.rentalType === 'WEEKLY') {
             end.setDate(end.getDate() + (parseInt(body.durationMonths) * 7));
          } else {
             end.setMonth(end.getMonth() + parseInt(body.durationMonths));
          }
          checkOutDate = end;
          nights = Math.max(1, Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));
      } else {
          checkOutDate = checkOutDate || new Date(checkInDate.getTime() + nights * 24 * 60 * 60 * 1000);
      }
    }
`;

// we need to be careful with `const body = await request.json()` because request body can only be read once.
// In the current code:
// const body = await request.json();
// const validated = createBookingSchema.safeParse(body);
// We can just use `validated.data` or `body` which is already defined earlier.
