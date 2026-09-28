# Design System & UI Specifications

## 1. Core Frameworks
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
- **Shadcn UI**: Unstyled, accessible components built on Radix UI primitives.
- **Lucide React**: Clean, consistent icon set.

## 2. Layout Patterns
- **Public Layout**: Standard top navigation bar (Navbar) + Footer. Centered container layout.
- **Dashboard Layout**: Left-side vertical sidebar (`HostSidebar`) for desktop, converting into top navigation dropdown links (`MobileNav` integration) on mobile screens.
- **Admin Layout**: Dedicated `/admin-portal` sidebar focusing on data-dense views.

## 3. Component Guidelines
- **Cards**: Used universally to encapsulate information chunks (Properties, Analytics, Profile Summaries, Booking Requests).
- **Tables**: Used exclusively for administrative dense data (Users, All Listings, All Bookings). Must be scrollable on mobile.
- **Avatars**: Fallback intelligently to the user's initials if `User.image` is null or throws a 404.
- **Badges**: Use contextual colors (Green for Approved/Published, Yellow for Pending/Requested, Red for Cancelled/Suspended).

## 4. Typography & Spacing
- Use standard Tailwind `text-sm`, `text-lg`, `text-2xl` for typographic hierarchy.
- Standard gap/spacing system relies on `gap-4`, `gap-6`, `p-4`, `p-6` to maintain consistent breathing room.

## 5. Interactive Elements
- **Maps**: Google Maps API utilized for visual property search and messaging location sharing.
- **Loaders**: Use Lucide's `<Loader2 className="animate-spin" />` for button loading states to prevent double submissions.
- **Toasts**: Utilize `sonner` for non-intrusive success/error notification banners across the application.
