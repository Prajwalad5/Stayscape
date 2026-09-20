import { z } from 'zod';

export const sendMessageSchema = z.object({
  conversationId: z.string().cuid().optional(),
  recipientId: z.string().cuid().optional(),
  propertyId: z.string().cuid().optional(),
  content: z.string().min(1, 'Message cannot be empty').max(5000),
}).refine((data) => data.conversationId || data.recipientId, {
  message: 'Either conversationId or recipientId is required',
});

export const createConversationSchema = z.object({
  recipientId: z.string().cuid(),
  propertyId: z.string().cuid().optional(),
  bookingId: z.string().cuid().optional(),
  initialMessage: z.string().min(1).max(5000),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type CreateConversationInput = z.infer<typeof createConversationSchema>;
