import { z } from 'zod';

// ===== Phase 1: Auth & Users =====
export const verifyEmailSchema = z.object({ token: z.string().min(1) });
export const verifyPhoneSchema = z.object({ phone: z.string().min(1), code: z.string().min(4).max(6) });
export const forgotPasswordSchema = z.object({ email: z.string().email() });
export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

export const updateProfileSchema = z.object({
  name: z.string().max(100).optional(),
  image: z.string().url().optional(),
  firstName: z.string().max(50).optional(),
  lastName: z.string().max(50).optional(),
  bio: z.string().max(500).optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  country: z.string().optional(),
  language: z.string().optional(),
  profilePhoto: z.string().url().optional(),
});

// ===== Phase 2: Listings =====
export const createListingSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(5000),
  propertyType: z.string().min(1),
  roomType: z.string().default('ENTIRE_PLACE'),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().optional(),
  country: z.string().min(1),
  postalCode: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  maxGuests: z.number().int().min(1).max(50),
  bedrooms: z.number().int().min(0).max(50),
  beds: z.number().int().min(1).max(50),
  bathrooms: z.number().min(0).max(50),
  pricePerNight: z.number().int().min(100), // in cents, at least $1
  cleaningFee: z.number().int().min(0).default(0),
  currency: z.string().default('usd'),
  minNights: z.number().int().min(1).default(1),
  maxNights: z.number().int().min(1).default(365),
  cancellationPolicy: z.string().default('FLEXIBLE'),
  isInstantBook: z.boolean().default(true),
  houseRules: z.string().max(2000).optional(),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  amenityIds: z.array(z.string()).optional(),
  images: z.array(z.object({ url: z.string().url(), caption: z.string().optional() })).optional(),
});

export const updateListingSchema = createListingSchema.partial();

export const priceRuleSchema = z.object({
  priceType: z.string().min(1),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  price: z.number().int().min(0),
});

export const cancellationPolicySchema = z.object({
  policyType: z.string().min(1),
  refundPercent: z.number().int().min(0).max(100),
  daysBefore: z.number().int().min(0),
});

// ===== Phase 3: Bookings =====
export const createBookingSchemaV1 = z.object({
  listingId: z.string().min(1),
  checkIn: z.coerce.date().optional(),
  checkOut: z.coerce.date().optional(),
  guests: z.number().int().min(1).optional(),
  adults: z.number().int().min(1).default(1),
  children: z.number().int().min(0).default(0),
  infants: z.number().int().min(0).default(0),
  pets: z.number().int().min(0).default(0),
  specialRequests: z.string().max(1000).optional(),
}).refine((d) => (!d.checkOut || !d.checkIn) || d.checkOut > d.checkIn, { message: 'Check-out must be after check-in', path: ['checkOut'] });

export const cancelBookingSchemaV1 = z.object({
  reason: z.string().min(1).max(500),
});

export const bookingQuoteSchema = z.object({
  listingId: z.string().min(1),
  checkIn: z.coerce.date().optional(),
  checkOut: z.coerce.date().optional(),
  guests: z.number().int().min(1).optional(),
});

// ===== Phase 4: Payments =====
export const createPaymentSchema = z.object({
  bookingId: z.string().min(1),
  paymentMethod: z.string().min(1),
  idempotencyKey: z.string().optional(),
  returnUrl: z.string().url().optional(),
});

export const refundPaymentSchema = z.object({
  amount: z.number().int().min(1).optional(), // partial refund amount; omit for full
  reason: z.string().max(500).optional(),
});

// ===== Phase 5: Reviews =====
export const createReviewSchemaV1 = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(2000),
  cleanliness: z.number().int().min(1).max(5).optional(),
  accuracy: z.number().int().min(1).max(5).optional(),
  communication: z.number().int().min(1).max(5).optional(),
  location: z.number().int().min(1).max(5).optional(),
  checkIn: z.number().int().min(1).max(5).optional(),
  value: z.number().int().min(1).max(5).optional(),
});

export const updateReviewSchema = z.object({
  comment: z.string().min(10).max(2000).optional(),
  hostResponse: z.string().max(2000).optional(),
});

// ===== Phase 6: Messaging =====
export const createConversationSchemaV1 = z.object({
  listingId: z.string().optional(),
  bookingId: z.string().optional(),
  participantId: z.string().min(1),
  message: z.string().min(1).max(5000),
});

export const sendMessageSchemaV1 = z.object({
  content: z.string().min(1).max(5000),
  messageType: z.string().default('text'),
  attachmentUrl: z.string().url().optional(),
});

// ===== Phase 7: Wishlists =====
export const createWishlistSchema = z.object({
  name: z.string().min(1).max(100),
});

export const addWishlistItemSchema = z.object({
  listingId: z.string().min(1),
});

// ===== Phase 8: Support =====
export const createTicketSchema = z.object({
  subject: z.string().min(5).max(200),
  description: z.string().min(10).max(5000),
  priority: z.string().default('MEDIUM'),
});

export const ticketMessageSchema = z.object({
  message: z.string().min(1).max(5000),
  attachmentUrl: z.string().url().optional(),
});

export const createDisputeSchema = z.object({
  bookingId: z.string().min(1),
  type: z.string().optional(),
  reason: z.string().min(10).max(2000),
  description: z.string().max(5000).optional(),
});

export const disputeEvidenceSchema = z.object({
  fileUrl: z.string().url(),
  fileType: z.string().min(1),
});

// ===== Phase 9: Admin =====
export const adminUpdateUserSchema = z.object({
  status: z.string().optional(),
  suspensionReason: z.string().max(500).optional(),
});

export const adminListingActionSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const resolveDisputeSchema = z.object({
  resolution: z.string().min(1).max(2000),
  refundAmount: z.number().int().min(0).optional(),
});

// ===== Phase 10: Notifications =====
export const notificationPreferenceSchema = z.object({
  eventType: z.string().min(1),
  enabled: z.boolean(),
  frequency: z.string().default('IMMEDIATE'),
});

// ===== Phase 11: Analytics =====
export const analyticsEventSchema = z.object({
  eventType: z.string().min(1),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// ===== Shared =====
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
