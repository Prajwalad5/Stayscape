import type {
  User,
  Property,
  PropertyImage,
  Amenity,
  Booking,
  Review,
  Conversation,
  Message,
  Notification,
  Payment,
  Payout,
} from '@prisma/client';

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// Property with relations
export interface PropertyWithDetails extends Property {
  host: Pick<User, 'id' | 'name' | 'image' | 'createdAt'>;
  images: PropertyImage[];
  amenities: { amenity: Amenity }[];
  _count?: {
    bookings: number;
    reviews: number;
    favorites: number;
  };
}

export interface PropertyCardData {
  id: string;
  title: string;
  city: string;
  country: string;
  pricePerNight: number;
  pricePerMonth?: number | null;
  pricePerWeek?: number | null;
  rentalType?: string | null;
  currency?: string;
  images: { url: string; isCover: boolean }[];
  averageRating: number | null;
  reviewCount: number;
  propertyType: string;
  roomType: string;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  isFavorited?: boolean;
}

// Booking with relations
export interface BookingWithDetails extends Booking {
  property: Property & {
    images: PropertyImage[];
    host: Pick<User, 'id' | 'name' | 'image'>;
  };
  guest: Pick<User, 'id' | 'name' | 'image' | 'email'>;
  review?: Review | null;
  payment?: Payment | null;
}

// Dashboard stats
export interface HostDashboardStats {
  totalListings: number;
  activeListings: number;
  totalBookings: number;
  pendingBookings: number;
  totalEarnings: number;
  thisMonthEarnings: number;
  averageRating: number;
  totalReviews: number;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalHosts: number;
  totalProperties: number;
  totalBookings: number;
  totalRevenue: number;
  platformCommission: number;
  pendingVerifications: number;
  openDisputes: number;
}

// Search params
export interface SearchParams {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string;
  minPrice?: string;
  maxPrice?: string;
  propertyType?: string;
  roomType?: string;
  bedrooms?: string;
  beds?: string;
  bathrooms?: string;
  amenities?: string;
  instantBook?: string;
  sort?: string;
  page?: string;
}

// User session
export interface UserSession {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: 'USER' | 'HOST' | 'ADMIN';
  isHost: boolean;
}

// Conversation with details
export interface ConversationWithDetails extends Conversation {
  participants: {
    user: Pick<User, 'id' | 'name' | 'image'>;
    lastReadAt: Date;
  }[];
  messages: (Message & {
    sender: Pick<User, 'id' | 'name' | 'image'>;
  })[];
  property?: Pick<Property, 'id' | 'title'> | null;
  _count?: {
    messages: number;
  };
}

// Notification
export interface NotificationData extends Notification {
  metadata: any;
}
