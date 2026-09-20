export const APP_NAME = 'StayScape';
export const APP_DESCRIPTION = 'Discover and book unique stays around the world';

export const PLATFORM_FEE_PERCENT = 0.12; // 12% service fee

export const PROPERTY_TYPES = [
  { value: 'HOUSE', label: 'House', icon: 'Home' },
  { value: 'APARTMENT', label: 'Apartment', icon: 'Building2' },
  { value: 'CABIN', label: 'Cabin', icon: 'TreePine' },
  { value: 'VILLA', label: 'Villa', icon: 'Castle' },
  { value: 'ROOM', label: 'Room', icon: 'DoorOpen' },
  { value: 'CONDO', label: 'Condo', icon: 'Building' },
  { value: 'COTTAGE', label: 'Cottage', icon: 'Warehouse' },
  { value: 'TOWNHOUSE', label: 'Townhouse', icon: 'LandPlot' },
  { value: 'LOFT', label: 'Loft', icon: 'Layers' },
  { value: 'UNIQUE', label: 'Unique Stay', icon: 'Sparkles' },
] as const;

export const ROOM_TYPES = [
  { value: 'ENTIRE_PLACE', label: 'Entire place' },
  { value: 'PRIVATE_ROOM', label: 'Private room' },
  { value: 'SHARED_ROOM', label: 'Shared room' },
] as const;

export const CANCELLATION_POLICIES = [
  { value: 'FLEXIBLE', label: 'Flexible', description: 'Full refund up to 24 hours before check-in' },
  { value: 'MODERATE', label: 'Moderate', description: 'Full refund up to 5 days before check-in' },
  { value: 'STRICT', label: 'Strict', description: '50% refund up to 7 days before check-in' },
] as const;

export const AMENITIES = [
  { name: 'WiFi', icon: 'Wifi', category: 'Essentials' },
  { name: 'Kitchen', icon: 'CookingPot', category: 'Essentials' },
  { name: 'Washer', icon: 'WashingMachine', category: 'Essentials' },
  { name: 'Dryer', icon: 'Wind', category: 'Essentials' },
  { name: 'Air conditioning', icon: 'Snowflake', category: 'Essentials' },
  { name: 'Heating', icon: 'Flame', category: 'Essentials' },
  { name: 'TV', icon: 'Tv', category: 'Essentials' },
  { name: 'Iron', icon: 'Shirt', category: 'Essentials' },
  { name: 'Workspace', icon: 'Monitor', category: 'Essentials' },
  { name: 'Free parking', icon: 'Car', category: 'Parking' },
  { name: 'Paid parking', icon: 'ParkingCircle', category: 'Parking' },
  { name: 'Pool', icon: 'Waves', category: 'Outdoor' },
  { name: 'Hot tub', icon: 'Bath', category: 'Outdoor' },
  { name: 'Patio', icon: 'Fence', category: 'Outdoor' },
  { name: 'BBQ grill', icon: 'Flame', category: 'Outdoor' },
  { name: 'Garden', icon: 'Flower2', category: 'Outdoor' },
  { name: 'Beach access', icon: 'Umbrella', category: 'Location' },
  { name: 'Lake access', icon: 'Sailboat', category: 'Location' },
  { name: 'Ski-in/ski-out', icon: 'Mountain', category: 'Location' },
  { name: 'Gym', icon: 'Dumbbell', category: 'Facilities' },
  { name: 'Elevator', icon: 'ArrowUpDown', category: 'Facilities' },
  { name: 'Wheelchair accessible', icon: 'Accessibility', category: 'Accessibility' },
  { name: 'Smoke alarm', icon: 'Siren', category: 'Safety' },
  { name: 'Carbon monoxide alarm', icon: 'ShieldAlert', category: 'Safety' },
  { name: 'Fire extinguisher', icon: 'FireExtinguisher', category: 'Safety' },
  { name: 'First aid kit', icon: 'Cross', category: 'Safety' },
  { name: 'Security cameras', icon: 'Camera', category: 'Safety' },
  { name: 'Pets allowed', icon: 'PawPrint', category: 'Policies' },
  { name: 'Smoking allowed', icon: 'Cigarette', category: 'Policies' },
  { name: 'Events allowed', icon: 'PartyPopper', category: 'Policies' },
] as const;

export const FEATURED_DESTINATIONS = [
  { name: 'New York', country: 'United States', image: '/images/destinations/new-york.jpg', lat: 40.7128, lng: -74.006 },
  { name: 'Los Angeles', country: 'United States', image: '/images/destinations/los-angeles.jpg', lat: 34.0522, lng: -118.2437 },
  { name: 'Miami', country: 'United States', image: '/images/destinations/miami.jpg', lat: 25.7617, lng: -80.1918 },
  { name: 'San Francisco', country: 'United States', image: '/images/destinations/san-francisco.jpg', lat: 37.7749, lng: -122.4194 },
  { name: 'London', country: 'United Kingdom', image: '/images/destinations/london.jpg', lat: 51.5074, lng: -0.1278 },
  { name: 'Paris', country: 'France', image: '/images/destinations/paris.jpg', lat: 48.8566, lng: 2.3522 },
  { name: 'Tokyo', country: 'Japan', image: '/images/destinations/tokyo.jpg', lat: 35.6762, lng: 139.6503 },
  { name: 'Barcelona', country: 'Spain', image: '/images/destinations/barcelona.jpg', lat: 41.3874, lng: 2.1686 },
] as const;

export const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'Newest' },
] as const;

export const BOOKING_STATUSES = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  PENDING_PAYMENT: { label: 'Pending Payment', color: 'bg-orange-100 text-orange-800' },
  AWAITING_PAYMENT: { label: 'Awaiting Payment', color: 'bg-orange-100 text-orange-800' },
  CONFIRMED: { label: 'Confirmed', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  COMPLETED: { label: 'Completed', color: 'bg-blue-100 text-blue-800' },
  REFUNDED: { label: 'Refunded', color: 'bg-purple-100 text-purple-800' },
  DISPUTED: { label: 'Disputed', color: 'bg-gray-100 text-gray-800' },
} as const;
