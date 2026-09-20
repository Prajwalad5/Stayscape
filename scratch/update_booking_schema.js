const fs = require('fs');
let c = fs.readFileSync('src/lib/validators/booking.ts', 'utf8');

const replacement = `export const createBookingSchema = z.object({
  propertyId: z.string().cuid(),
  checkIn: z.coerce.date().optional(),
  checkOut: z.coerce.date().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  guestCount: z.number().int().min(1),
  durationMonths: z.number().int().min(1).optional(),
  specialRequests: z.string().max(1000).optional(),
}).refine((data) => {
  // We need at least one pair of dates or a duration
  return (data.checkIn && data.checkOut) || (data.startDate && data.endDate) || (data.startDate) || (data.durationMonths);
}, {
  message: 'Must provide valid dates or rental duration',
});`;

c = c.replace(/export const createBookingSchema = z\.object\(\{[\s\S]*?\}\);/, replacement);

fs.writeFileSync('src/lib/validators/booking.ts', c);
