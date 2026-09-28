# Product Requirements Document (PRD)

## 1. Project Overview
**Name**: Rental Marketplace Platform
**Description**: A full-stack, Airbnb-style property rental platform designed to support short-term, weekly, and monthly/long-term leases. The platform connects guests looking for accommodations with hosts managing properties, overseen by a robust admin portal.

## 2. Target Audience
- **Guests**: Users looking to book temporary stays or sign long-term monthly rental agreements.
- **Hosts**: Property owners looking to list their properties, manage calendars, handle reviews, and track analytics/revenue.
- **Administrators**: Platform operators monitoring user safety, resolving disputes, and handling platform-wide analytics and unlisting/suspensions.

## 3. Core Features & Requirements

### 3.1 Authentication & Profiles
- Secure Authentication via NextAuth (Credentials & OAuth support).
- Granular RBAC (Guest, Host, Admin).
- Fully synchronized user profiles (Avatar, Name, Bio) synced across public profiles, reviews, and navbar sessions instantly via App Router revalidation.
- Secure local image uploads for profile pictures with crypto-hashing.

### 3.2 Property Listings (Hosts)
- Dynamic listing creation (Property Type, Room Type, Amenities, Location).
- Support for Short Term (Nightly), Weekly, and Monthly (Long Term) pricing models.
- Interactive calendar management to view requested vs. active rentals.
- Host Analytics dashboard tracking revenue (in NPR), conversion rates, and booking statistics.

### 3.3 Bookings & Reservations (Guests)
- Intuitive booking request cards.
- Automated bypassing of rigid check-in/out dates for Monthly leases (using `durationMonths`).
- Trip management dashboard separating "Requested Rentals" from "Active Bookings".
- Favorite/Saved properties system.

### 3.4 Messaging & Notifications
- Real-time or polled messaging threads between Guests and Hosts.
- Location Sharing: Ability to inject a live map-pin into chat directly linking to property coordinates.

### 3.5 Global Currency
- The platform strictly operates in Nepalese Rupee (NPR) as the default currency format for display and calculations.

### 3.6 Interactive Maps
- Homepage live interactive map showing all published properties using `@vis.gl/react-google-maps`.
