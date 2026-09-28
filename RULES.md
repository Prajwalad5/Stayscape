# Development Rules & Constraints

## 1. Do Not Destroy Existing Architecture
- **Rule**: DO NOT rebuild the project from scratch. Do not create duplicate pages or secondary apps. Integrate new features gracefully into the existing Next.js App Router and Prisma schema.
- **Rule**: Reuse existing UI components and layouts whenever possible.

## 2. Currency Enforcement
- **Rule**: The platform's primary currency is **NPR (Nepalese Rupee)**.
- **Rule**: Do not hardcode `$` or `USD`. Use the centralized `formatPrice()` or `formatCurrency()` from `src/lib/utils.ts`.

## 3. Responsive UI Requirements
- **Rule**: Mobile-first design is mandatory. Do not design desktop-first and simply shrink elements.
- **Rule**: Prevent horizontal overflow on the body `overflow-x: hidden`.
- **Rule**: Wide components (Data Tables, Admin panels, TabsLists) must be wrapped in horizontally scrollable containers (`overflow-x-auto`) to prevent mobile layout breakage.
- **Rule**: Host Sidebar navigation must collapse gracefully on mobile. Use the mobile Navbar dropdown for host navigation on small screens.

## 4. Booking Logic Strictness
- **Rule**: Requested rentals DO NOT block property availability until they are APPROVED/CONFIRMED.
- **Rule**: Monthly/Long Term rentals do not strictly adhere to standard daily hotel check-in/out date validations. Utilize `durationMonths` logic and allow optional check-in parameters.

## 5. Security & Validation
- **Rule**: All API endpoints MUST validate incoming JSON payloads using the single source of truth schemas defined in `src/lib/validators/index.ts`.
- **Rule**: File uploads must generate secure, randomized filenames and validate extensions/MIME types to prevent executable upload exploits.

## 6. Profile Synchronization
- **Rule**: Public profiles, property cards, and reviews must fetch the user's avatar from `User.image` and name from `User.name`. Updates to these fields must trigger `revalidatePath('/', 'layout')` to purge stale server caches.
