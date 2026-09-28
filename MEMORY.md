# Agent Memory & Architectural Decisions

## Key Technical Decisions
1. **Currency (NPR)**
   - The platform strictly enforces Nepalese Rupee (NPR). All database entries for price (e.g. `pricePerNight`, `pricePerMonth`) are stored in *cents* (multiplied by 100) and formatted correctly by `formatPrice(val / 100)` or `formatCurrency` on the client.
2. **Booking Schema Flexibility**
   - The Zod `createBookingSchemaV1` schema allows `checkIn` and `checkOut` dates to be `.optional()`. This prevents the "Invalid input" error when Guests attempt to book `MONTHLY` leases that rely purely on `durationMonths` instead of explicit dates.
3. **Profile Synchronization**
   - The `UserProfile` relation exists, but the public-facing pages (Property Cards, Reviews, Public Profiles) strictly read the top-level `User.image` and `User.name`.
   - The `PATCH /api/v1/users/me` API endpoint uses `revalidatePath('/', 'layout')` to purge Next.js server caches, guaranteeing immediate public propagation of profile edits.
   - NextAuth JWT session updating is handled by injecting `token.name` and `token.picture` during the `update` trigger in `src/auth.config.ts`, syncing the client's Navbar avatar instantly.
4. **Mobile Responsiveness Strategy**
   - `overflow-x: hidden` is applied globally to `body`.
   - Data-heavy components (`Table`, `TabsList`) rely on explicit `overflow-x-auto` wrappers.
   - The `HostSidebar` is hidden via `lg:hidden` on small screens; host navigation is dynamically injected into the standard top `Navbar` dropdown when `isHostDashboard` is true.

## Known Edge Cases
- File uploads directly write to `public/uploads` using Node `fs`. In a serverless production environment (like Vercel), this must be swapped for an S3/Cloud Storage bucket as local writes are ephemeral.
