# System Architecture

## 1. High-Level Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Database**: Prisma ORM with SQLite (Local/Dev) or PostgreSQL (Production).
- **Styling**: Tailwind CSS + Shadcn UI components.
- **Authentication**: NextAuth.js (Auth.js) v5 with JWT Strategy.

## 2. Directory Structure
- `/src/app`: Next.js App Router endpoints, pages, and API routes.
  - `(dashboard)`: Protected dashboard routes for Hosts and Guests.
  - `(public)`: Unauthenticated routes (Homepage, Public Profiles, Property details).
  - `/admin-portal`: Dedicated administration panels.
  - `/api`: REST/Serverless endpoints handling JSON communication.
- `/src/components`: Reusable React components.
  - `/ui`: Shadcn UI atomic components.
  - `/property`, `/booking`, `/layout`: Feature-specific modular components.
- `/src/lib`: Core utilities, singletons, and shared logic.
  - `prisma.ts`: Prisma Client instantiation.
  - `validators/index.ts`: Centralized Zod validation schemas.
  - `utils.ts`: Tailwind merging and currency formatting.
- `/prisma`: Database schema definition and seed files.
- `/public/uploads`: Local filesystem storage target for uploaded images.

## 3. Data Flow & State Management
- **Server Components**: Used heavily for data fetching (e.g., fetching listings, dashboard analytics) to minimize client-side JavaScript.
- **Client Components**: Used only where interactivity is required (Forms, Map instances, Modals, Sliders).
- **Session Management**: Session is stored in a JWT. Client-side updates to user profiles (name/image) trigger `useSession().update(...)` to mutate the JWT and instantly update UI without a hard reload.
- **Cache Invalidation**: Next.js Data Cache is purged dynamically using `revalidatePath('/', 'layout')` during critical updates (like profile modifications or booking approvals) to ensure all public sector routes display fresh data.

## 4. API & Validation
- All incoming API requests are validated using `zod` schemas prior to Prisma execution.
- Complex booking logic adapts validation dynamically (e.g. dropping `checkIn` constraints for `MONTHLY` rentals).
