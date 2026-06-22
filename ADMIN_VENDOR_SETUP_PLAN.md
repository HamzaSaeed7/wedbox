# Admin: Vendor Onboarding & Service Setup

## Context
Admins currently can only view vendors, create users, ban/verify/activate plans, and delete. There is **no way for an admin to complete a vendor's onboarding profile or build out their service + per-category service details** on the vendor's behalf. This is needed so staff can manually onboard vendors (e.g. paid offline, or who need hands-on setup).

The vendor self-serve flow already does all of this, scoped to `$request->user()`:
- Onboarding profile → `Vendor/Onboarding.tsx` + `VendorOnboardingController::complete`
- Service basic info + images → inline form in `Dashboard/Vendor.tsx`
- Per-category service details → reusable `components/vendor/ServiceSubdataEditor.tsx` saved via `VendorServiceController::updateSubdata` (+ all `save*` helpers keyed by `service_id`).

**Goal:** Let an admin do the same for any vendor, reached from each row in Admin → Vendors, bypassing the subscription gate, with the ability to create a brand-new vendor inline first. Maximize reuse of the existing `ServiceSubdataEditor` and backend save logic — no duplication of the heavy per-category code.

## Confirmed decisions
- **Entry point:** a "Setup" action button on each row in the existing Admin → Vendors table (`AdminVendors` in `Dashboard/Admin.tsx`).
- **Subscription gate:** bypassed — admin can save onboarding + service details regardless of `vendor_subscription_status`.
- **Scope:** create + configure — a "New vendor" button creates the account inline (reusing the existing create-user endpoint), then opens the same setup panel.

## Backend

### 1. Extract reusable subdata logic into a trait (pure move, no behavior change)
New file `app/Http/Controllers/Concerns/HandlesServiceSubdata.php`. Move from `VendorServiceController`:
- `loadSubData(Service $service): void`
- the category dispatch currently inside `updateSubdata` → new method `saveServiceSubdata(Service $service, array $d): void`
- all private `save*` methods (`saveVenue` … `saveHair`) — make them `protected`.

Refactor `app/Http/Controllers/Vendor/VendorServiceController.php` to `use HandlesServiceSubdata` and call `$this->saveServiceSubdata(...)` / `$this->loadSubData(...)`. Vendor behavior unchanged. Also extract the "auto-create a draft service from onboarding data" block in `VendorServiceController::index` into a trait helper `ensureServiceForVendor(User $vendor)` so admin reuses identical logic.

### 2. New `app/Http/Controllers/Admin/AdminVendorSetupController.php` (`use HandlesServiceSubdata`)
Guard every method with `abort_unless($vendor->role === 'vendor', 404)`. No ownership check (admin middleware already enforces admin).
- `show(User $vendor)` → returns `{ profile, categories (id,name,slug), cities (id,name), services }`. Calls `ensureServiceForVendor` if a profile with category exists; each service is returned with `category` + subdata loaded via `loadSubData`.
- `saveOnboarding(Request, User $vendor)` → same validation as `VendorOnboardingController::complete` (business_name required, category_id exists, etc.). Create/update the `VendorProfile` with `onboarding_completed = true`. **No subscription check.** Returns fresh profile. (Once a service already exists, treat `category_id` as immutable — ignore changes — matching the existing "category set once" design.)
- `createService(Request, User $vendor)` → validate `category_id`/`title`/`description`/`location`/`minimum_price`/`images`; create `Service` with `vendor_id = $vendor->id`, `status = 'draft'`.
- `updateService(Request, Service $service)` → validate `title`/`description`/`location`/`minimum_price`/`images`/`status (active|inactive|draft)`; `$service->update(...)`.
- `updateSubdata(Request, Service $service)` → `$this->saveServiceSubdata($service->load('category'), $request->input('data', []))`; return service with subdata reloaded.

### 3. Routes — `routes/api.php`, inside the existing `admin` group (around line 122)
```php
Route::get('/vendors/{user}/setup',          [AdminVendorSetupController::class, 'show']);
Route::post('/vendors/{user}/onboarding',    [AdminVendorSetupController::class, 'saveOnboarding']);
Route::post('/vendors/{user}/services',      [AdminVendorSetupController::class, 'createService']);
Route::put('/services/{service}/admin-update',   [AdminVendorSetupController::class, 'updateService']);
Route::put('/services/{service}/admin-subdata',  [AdminVendorSetupController::class, 'updateSubdata']);
```
(Distinct paths avoid colliding with the existing `DELETE /services/{service}` and `PATCH /services/{service}/feature`.) Vendor account creation reuses the existing `POST /admin/users` (`createUser`) — no new endpoint.

## Frontend

### 4. `resources/js/lib/api.ts` — extend `adminApi`
```ts
vendorSetup:        (id) => api.get(`/admin/vendors/${id}/setup`).then(r => r.data),
saveVendorOnboarding:(id, d) => api.post(`/admin/vendors/${id}/onboarding`, d).then(r => r.data),
createVendorService:(id, d) => api.post(`/admin/vendors/${id}/services`, d).then(r => r.data),
updateVendorService:(sid, d) => api.put(`/admin/services/${sid}/admin-update`, d).then(r => r.data),
updateVendorSubdata:(sid, data) => api.put(`/admin/services/${sid}/admin-subdata`, { data }).then(r => r.data),
```

### 5. New `resources/js/components/admin/VendorSetupPanel.tsx`
Full-screen overlay (`position: fixed`, like the FeedbackWidget modal pattern) taking `{ vendorId, onClose }`. Sections via a tab row (reusing the `.tabs/.tab` classes from Vendor.tsx):
- **Onboarding** — the form fields from `Vendor/Onboarding.tsx` (avatar via `uploadApi.avatar`, business name/description, category `select`, address1/2, country, city, phone with the same `phoneError` validation), prefilled from `profile`. Save → `adminApi.saveVendorOnboarding`. Category select disabled once a service exists.
- **Service** — basic-info form mirroring `Dashboard/Vendor.tsx` lines ~360-428: title, location, `CurrencyInput` price, image grid with add/remove via `uploadApi.serviceImage`, description; plus a Publish/Unpublish toggle (`status`). Save → `adminApi.updateVendorService`. If no service yet, a "Create service" button → `adminApi.createVendorService`.
- **Service details** — `<ServiceSubdataEditor service={fullService} onSave={d => subdataMut.mutate(d)} isSaving={…} />`, reusing the existing component unchanged.

Data fetched with React Query key `['admin-vendor-setup', vendorId]`; invalidate on each save. Toasts via `useStore(s => s.showToast)`.

### 6. `resources/js/Pages/Dashboard/Admin.tsx` — wire into `AdminVendors`
- Add a **"New vendor"** button next to the search box → small modal (name, email, password) → `adminApi.createUser({ name, email, role: 'vendor', password })` → on success set `setupVendorId` to the new user id (opens panel) and invalidate `['admin-vendors']`.
- Add a **Setup** icon button (`settings` or `edit` from `Icon`) in each row's Actions cell → `setSetupVendorId(v.id)`.
- Render `{setupVendorId && <VendorSetupPanel vendorId={setupVendorId} onClose={() => { setSetupVendorId(null); qc.invalidateQueries({queryKey:['admin-vendors']}); }} />}`.

## Reused existing code (no reinvention)
- `components/vendor/ServiceSubdataEditor.tsx` — per-category details editor (props: `service`, `onSave`, `isSaving`).
- `components/shared/CurrencyInput.tsx`, `components/shared/Icon.tsx`.
- `uploadApi.avatar` / `uploadApi.serviceImage` in `lib/api.ts`.
- `phoneError` validation + form layout from `Vendor/Onboarding.tsx`.
- Backend `save*` helpers + `loadSubData` + onboarding validation, via the new trait — single source of truth shared with the vendor flow.

## Verification
1. `npm run build` succeeds (TS types clean) and `php artisan route:list` shows the 5 new admin routes.
2. Dev server is already running (Vite + Laravel on :8000). Log in as admin → Admin → Vendors.
3. **Existing vendor:** click Setup on a row → panel opens prefilled. Edit onboarding → Save (toast). Switch to Service → set title/price, upload 2+ images, Save → Publish. Switch to Service details → fill category fields → Save. Reload panel → values persisted.
4. **New vendor:** "New vendor" → create → panel opens → complete onboarding + service → confirm the row appears as "Approved" and the service is visible on the public site.
5. Confirm a vendor with **no active subscription** can still be fully set up (gate bypassed).
6. Regression: confirm the normal vendor self-serve flow (`/dashboard/vendor` service details save) still works after the trait refactor.
7. Verify in-browser with `preview_*` tools (snapshot + screenshot of the panel; network check on the save calls). No production DB or deploy actions.
