import { z } from 'zod';

export const createBookingSchema = z.object({
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
});

export const cancelBookingSchema = z.object({
  bookingId: z.string().cuid(),
  reason: z.string().min(1, 'Please provide a reason').max(500),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
