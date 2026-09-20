import { z } from 'zod';

export const propertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title is too long'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000),
  propertyType: z.enum(['HOUSE', 'APARTMENT', 'CABIN', 'VILLA', 'ROOM', 'CONDO', 'COTTAGE', 'TOWNHOUSE', 'LOFT', 'UNIQUE']),
  roomType: z.enum(['ENTIRE_PLACE', 'PRIVATE_ROOM', 'SHARED_ROOM']),
  
  // Location
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  countryCode: z.string().optional(),
  postalCode: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional().default(0),
  longitude: z.number().min(-180).max(180).optional().default(0),
  googlePlaceId: z.string().optional(),
  formattedAddress: z.string().optional(),
  currency: z.string().default('NPR'),
  
  // Capacity
  maxGuests: z.coerce.number().int().min(1).max(50),
  bedrooms: z.coerce.number().int().min(0).max(50),
  beds: z.coerce.number().int().min(0).max(100).optional(),
  bathrooms: z.coerce.number().min(0).max(50),
  kitchens: z.coerce.number().int().min(0).max(50).optional().default(0),
  livingRooms: z.coerce.number().int().min(0).max(50).optional().default(0),
  totalRooms: z.coerce.number().int().min(0).max(100).optional(),
  
  // Pricing (in cents)
  pricePerNight: z.coerce.number().int().min(0).default(0),
  cleaningFee: z.coerce.number().int().min(0).default(0),
  
  // Stay rules
  minNights: z.coerce.number().int().min(1).default(1),
  maxNights: z.coerce.number().int().min(1).default(365),
  
  // Policies
  cancellationPolicy: z.enum(['FLEXIBLE', 'MODERATE', 'STRICT']).default('FLEXIBLE'),
  isInstantBook: z.boolean().default(true),
  
  // Rules & instructions
  houseRules: z.string().max(2000).optional(),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  checkInInstructions: z.string().max(2000).optional(),
  
  // Amenities
  amenityIds: z.array(z.string()).optional(),
  
  // Rental configuration
  rentalType: z.enum(['SHORT_TERM', 'MONTHLY', 'WEEKLY', 'DAILY', 'LONG_TERM', 'CUSTOM']).optional().default('SHORT_TERM'),
  pricePerWeek: z.coerce.number().int().min(0).optional(),
  pricePerMonth: z.coerce.number().int().min(0).optional(),
  securityDeposit: z.coerce.number().int().min(0).optional().default(0),
  advanceRequired: z.boolean().optional().default(false),
  advanceType: z.string().optional(),
  advanceAmount: z.coerce.number().int().min(0).optional(),
  fixedTerm: z.boolean().optional().default(false),
  electricityBillingType: z.string().optional(),
  electricityCharge: z.coerce.number().int().min(0).optional(),
  waterBillingType: z.string().optional(),
  waterCharge: z.coerce.number().int().min(0).optional(),
  internetBillingType: z.string().optional(),
  internetCharge: z.coerce.number().int().min(0).optional(),
  maintenanceCharge: z.coerce.number().int().min(0).optional(),
  parkingCharge: z.coerce.number().int().min(0).optional(),
  
  // Images
  images: z.array(z.object({
    url: z.string(),
    isCover: z.boolean().optional().default(false),
  })).optional(),
}).superRefine((data, ctx) => {
  if (['MONTHLY', 'LONG_TERM'].includes(data.rentalType || '')) {
    if (data.pricePerMonth === undefined || data.pricePerMonth < 2000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Minimum monthly rent should be at least 2000",
        path: ["pricePerMonth"]
      });
    }
  }
});

export const propertySearchSchema = z.object({
  location: z.string().optional(),
  north: z.coerce.number().optional(),
  south: z.coerce.number().optional(),
  east: z.coerce.number().optional(),
  west: z.coerce.number().optional(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  guests: z.coerce.number().int().min(1).optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().optional(),
  propertyType: z.string().optional(),
  roomType: z.string().optional(),
  bedrooms: z.coerce.number().int().min(0).optional(),
  beds: z.coerce.number().int().min(0).optional(),
  bathrooms: z.coerce.number().min(0).optional(),
  amenities: z.string().optional(),
  instantBook: z.coerce.boolean().optional(),
  sort: z.enum(['recommended', 'price_asc', 'price_desc', 'rating', 'newest']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export type PropertyInput = z.infer<typeof propertySchema>;
export type PropertySearchInput = z.infer<typeof propertySearchSchema>;
