import { z } from 'zod';

export const createReviewSchema = z.object({
  bookingId: z.string().cuid(),
  overallRating: z.number().int().min(1).max(5),
  cleanliness: z.number().int().min(1).max(5),
  accuracy: z.number().int().min(1).max(5),
  communication: z.number().int().min(1).max(5),
  location: z.number().int().min(1).max(5),
  checkIn: z.number().int().min(1).max(5),
  value: z.number().int().min(1).max(5),
  comment: z.string().min(10, 'Review must be at least 10 characters').max(2000),
});

export const hostResponseSchema = z.object({
  reviewId: z.string().cuid(),
  response: z.string().min(10, 'Response must be at least 10 characters').max(1000),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type HostResponseInput = z.infer<typeof hostResponseSchema>;
