# Project Task Tracking

## Completed (Phases 1-13)
- [x] **Project Initialization**: Next.js, Prisma, SQLite setup.
- [x] **Authentication**: NextAuth integration, Registration, Login.
- [x] **User Management**: Unified Host/Guest profiles, Settings page, File Upload API for Avatars.
- [x] **Property Listings**: Multi-step creation form, dynamic pricing (Nightly, Weekly, Monthly).
- [x] **Search & Maps**: Global search filters, live property map on homepage.
- [x] **Booking System**: Request-to-book flow, Admin/Host approval pipeline, `durationMonths` logic for long-term leases.
- [x] **Host Dashboard**: Calendar, Reservations management, Analytics/Revenue tracking, Reviews aggregator.
- [x] **Guest Dashboard**: Separated "Requested" vs "Active" trips, Favorites/Wishlist management.
- [x] **Messaging**: Real-time message threads, Map-Pin Location sharing integration.
- [x] **Admin Portal**: Centralized moderation (Users, Listings, Bookings), Data tables with horizontal scroll.
- [x] **Platform Upgrades**: Global NPR currency enforcement, comprehensive mobile responsiveness overhaul.
- [x] **Bug Fixes**: Zod validation fixes for monthly rental dates, Profile image cache synchronization via `update()` and `revalidatePath`.

## Pending / Future Roadmap
- [ ] **Real-time WebSockets**: Upgrade messaging from polling to real-time WebSockets or Server-Sent Events.
- [ ] **Payment Gateway**: Integrate live Stripe/Khalti API webhooks for actual monetary transactions (currently simulated in UI).
- [ ] **Email Infrastructure**: Integrate SendGrid/Resend to trigger real email notifications on booking requests/approvals.
- [ ] **Database Migration**: Migrate SQLite dev database to PostgreSQL for production Vercel deployment.
