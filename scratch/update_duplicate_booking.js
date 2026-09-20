const fs = require('fs');
let c = fs.readFileSync('src/app/api/bookings/route.ts', 'utf8');

const idempotencyCheck = `
      // Prevent duplicate pending requests from the same user for the same property
      const existingPending = await prisma.booking.findFirst({
        where: {
          propertyId,
          guestId: userId,
          bookingStatus: { in: ['PENDING', 'PENDING_APPROVAL', 'REQUESTED'] },
        }
      });
      
      if (existingPending) {
        return NextResponse.json(
          { success: false, error: { code: 'CONFLICT', message: 'You already have a pending request for this property.' } },
          { status: 409 }
        );
      }
`;

c = c.replace(/\/\/ Prevent booking own property/, idempotencyCheck + '\n      // Prevent booking own property');

fs.writeFileSync('src/app/api/bookings/route.ts', c);
