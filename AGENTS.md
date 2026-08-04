# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

WedBox is a **Cyprus wedding marketplace** — a Laravel 13 + Inertia.js + React SPA. There is **no separate frontend folder**; everything lives in `backend/`. The React app is rendered server-side via Inertia, with Laravel serving all routes.

## Commands

All commands must be run from `backend/`.

```bash
# Start full dev environment (Laravel server + queue + logs + Vite HMR all at once)
composer run dev

# Build production assets (required after any TSX/CSS change when not running dev)
npm run build

# Run database migrations
php artisan migrate

# Clear caches (run after .env or route changes)
php artisan config:clear && php artisan route:clear

# Create storage symlink (once, for avatar uploads)
php artisan storage:link

# Open a PHP REPL
php artisan tinker
```

> **Important:** The app requires `npm run build` OR the Vite dev server running for Inertia to serve pages. If you see `ViteManifestNotFoundException`, run `npm run build`.

## Architecture

### Request Flow

```
Browser → Laravel Router (web.php / api.php)
         → Inertia Middleware (HandleInertiaRequests — shares auth.user, flash)
         → Controller → inertia('PageName', props)
         → React page rendered client-side via app.jsx
```

### Auth Model

Session-based — **no Bearer tokens**. Laravel Sanctum's `EnsureFrontendRequestsAreStateful` is prepended to the API middleware group so session cookies authenticate `/api/*` routes.

- **Web routes** (`/auth/login`, `/auth/register`, `/auth/logout`) use `webApi` axios instance with `baseURL: '/'`
- **API routes** (`/api/*`) use `api` axios instance with `baseURL: '/api'`
- Both use `withCredentials: true`
- CSRF token is read from `<meta name="csrf-token">` in `app.blade.php` and set globally in `app.jsx`

### Vendor Onboarding Gate

Vendor login triggers a server-computed redirect in `AuthController::webLogin`:
1. No active subscription → `/vendor/pricing`
2. Active subscription, onboarding incomplete → `/vendor/onboarding`
3. Both complete → `/dashboard/vendor`

The `/dashboard/vendor` web route enforces this gate server-side too (not just on login).

### Key Files

| File | Purpose |
|------|---------|
| `routes/web.php` | Inertia page routes + auth + vendor onboarding + Stripe webhook |
| `routes/api.php` | JSON API routes (all authenticated via `auth:sanctum`) |
| `bootstrap/app.php` | Middleware setup — Sanctum stateful, vendor/admin aliases |
| `app/Http/Middleware/HandleInertiaRequests.php` | Shares `auth.user` (including `vendor_subscription_status`, `vendorProfile`) with every page |
| `resources/js/app.jsx` | Inertia bootstrap, QueryClient setup, global axios config |
| `resources/js/store/index.ts` | Zustand store — auth state, cart, favorites, toasts; `useAuthUser()` hook reads from Inertia shared props |
| `resources/js/lib/api.ts` | All axios API calls organized by domain (`authApi`, `vendorApi`, `vendorOnboardingApi`, etc.) |
| `resources/js/Layouts/PublicLayout.tsx` | Wraps all public pages; syncs Inertia `auth.user` into Zustand |
| `vite.config.js` | Must set `build.rollupOptions.input` explicitly (laravel-vite-plugin v3.1 uses Rolldown API, Vite 6 still uses Rollup) |

### Frontend Conventions

- **Pages** live in `resources/js/Pages/**/*.tsx` — Inertia resolves them by name, e.g. `inertia('Dashboard/Vendor')` → `Pages/Dashboard/Vendor.tsx`
- **Reading auth user**: Use `useAuthUser()` from the store (reads Inertia shared props), NOT `useStore(s => s.user)`, for SSR-consistent access
- **Navigation**: Use `router.visit('/path')` from `@inertiajs/react`, not `window.location`
- **Toast notifications**: `useStore(s => s.showToast)('message', 'success'|'error'|'info')`
- **TanStack React Query v5** is available globally via `QueryClientProvider` in `app.jsx`; use it for data fetching in components
- Dashboard pages (`Vendor.tsx`, `Admin.tsx`, `Customer.tsx`) are self-contained single-file SPA sections with sub-navigation driven by `usePage().props.sub`

### Backend Conventions

- Controllers are namespaced: `App\Http\Controllers\Vendor\*`, `App\Http\Controllers\Admin\*`
- The `vendor` middleware alias checks `role === 'vendor'` AND `!isBanned()`; it does **not** check subscription/onboarding status
- Email is sent via **Brevo** (`MAIL_MAILER=brevo`); `QUEUE_CONNECTION=sync` so emails send immediately
- `STRIPE_SECRET`, `STRIPE_PRICE_3MONTH`, `STRIPE_PRICE_12MONTH` in `.env` — configured in `config/services.stripe`
- Avatar uploads go to `storage/app/public/avatars/`, served via the `public/storage` symlink

### Database

MySQL (`DB_CONNECTION=mysql`, default database `wedbox`). Notable schema decisions:
- `users.vendor_subscription_status` — `null` | `'pending'` | `'active'` | `'cancelled'`
- `users.vendor_plan` — `null` | `'3month'` | `'12month'`
- `vendor_profiles.onboarding_completed` — boolean; profile row is created during onboarding, not at registration
- `vendor_profiles.category_id` — set once during onboarding, considered immutable

### Environment Constraints

- The Stripe price IDs in `.env` must be **test mode** prices (matching the `sk_test_` key). Live-mode prices will return a 400 from Stripe.
- The dev-verify route (`POST /api/auth/dev-verify`) exists only in `local` environment — remove before production.
- `SANCTUM_STATEFUL_DOMAINS` must include the dev domain (`localhost:8000`) for session cookies to work with Inertia.
