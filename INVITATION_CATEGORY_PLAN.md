# Add "Invitation" Category (vendor setup + customer service page)

## Context
WedBox has 18 service categories, each wired through the same end-to-end pipeline. The user wants a **19th category, "Invitation"**, behaving like the others (same listing card + image handling) but with a bespoke form on both the vendor side (defining what they offer) and the customer service-page side (ordering). Driven by the hand sketch + confirmed answers.

## Confirmed data model
- **Pricing:** per-design unit price. Each design has its own price-per-invitation (e.g. €1.50).
- **Types:** vendor sets a price for each of *Digital / Printed / Save the Date*; customer may select **one or more**.
- **Content:** customer types invitation wording in a **text box only** (no custom-design upload).
- **Add-ons:** vendor-defined list (e.g. Envelope, Wax seal), each with a price; customer multi-selects.
- **Quantity** + **needed-by date** captured on the order.
- **Customer total** = `(chosen design price + Σ selected type prices + Σ selected add-on prices) × quantity`.

## How the pipeline works today (patterns to mirror — closest analog: **florist**)
- Categories: `categories` table (seeded in `DatabaseSeeder`) + UI config in `resources/js/lib/data.ts`.
- Per-category sub-tables + Eloquent models (e.g. `ServiceFlorist` + `service_florist_designs/_addons`), joined to `Service` via `hasOne` in `app/Models/Service.php`.
- Vendor editor: `resources/js/components/vendor/ServiceSubdataEditor.tsx` — dispatches a per-slug form, pre-fills via `extractSubdata`, saves via `onSave`.
- Vendor save: `Vendor/VendorServiceController.php::updateSubdata` → per-slug `save*` helper (delete + re-insert children).
- Public load: `ServiceController.php::loadSubData` (its own copy) eager-loads sub-data for the service page.
- Customer order form: `resources/js/components/booking/forms/BookingForms.tsx` — per-slug form registered in `BOOKING_FORM_MAP`; emits `{ total, summary, payload }`.
- Order persistence: `CartController.php::createOrderDetail` maps payload → an `Order<X>` model (`$modelMap` + `match`). `Order::detail()` (`app/Models/Order.php`) resolves the detail model by `order_type`.

## Implementation

### Database — one new migration `2026_06_19_..._add_invitation_category.php`
1. Insert the category: `DB::table('categories')->insert(['name'=>'Invitation','slug'=>'invitation','description'=>'Wedding invitations and stationery.','order'=>19, ...])` (idempotent — guard with a `where('slug','invitation')->exists()` check).
2. Create tables:
   - `service_invitations` — `id, service_id (fk, unique), timestamps` (parent row).
   - `service_invitation_types` — `id, service_invitation_id (fk), name, price (decimal), timestamps`.
   - `service_invitation_designs` — `id, service_invitation_id (fk), name, image (nullable), price (decimal), timestamps`.
   - `service_invitation_addons` — `id, service_invitation_id (fk), name, price (decimal), timestamps`.
   - `order_invitations` — `id, order_id (fk), quantity (int), needed_by (date, nullable), selected_types (json), design_id (nullable), selected_addons (json), invitation_text (text, nullable), timestamps`.
   `down()` drops the 5 tables + deletes the category row.

### Models (`app/Models/`)
- New: `ServiceInvitation` (hasMany `types`, `designs`, `addons`), `ServiceInvitationType`, `ServiceInvitationDesign`, `ServiceInvitationAddon`, `OrderInvitation` (casts `selected_types`/`selected_addons` → array, `needed_by` → date).
- `Service.php`: add `public function invitation() { return $this->hasOne(ServiceInvitation::class); }`.
- `Order.php`: add `'invitation' => $this->hasOne(OrderInvitation::class)` to the `detail()` match.

### Backend controllers
- `Vendor/VendorServiceController.php`: add `'invitation'` to `loadSubData` (`$service->load('invitation.types','invitation.designs','invitation.addons')`) and to the `updateSubdata` match → new `saveInvitation(int $sid, array $d)` (upsert parent; delete + re-insert types/designs/addons — modeled on `saveFlorist`).
- `ServiceController.php`: add the same `'invitation'` case to its `loadSubData`.
- `CartController.php`: add `'invitation' => \App\Models\OrderInvitation::class` to `$modelMap`, and an `'invitation'` arm to the `match` mapping payload → `['quantity','needed_by','selected_types','design_id','selected_addons','invitation_text']`.

### Frontend
- `lib/data.ts`: append `{ slug:'invitation', name:'Invitations', icon:'mail', color:'#C98A5B' }` to `CATEGORIES` (reuse an existing Icon; verify `mail`/`msg` exists in `Icon.tsx`, else add a simple envelope path).
- `lib/types.ts`: add `InvitationConfig` (types[], designs[], addons[]) and `invitation?: InvitationConfig` on the `Service` type.
- `components/vendor/ServiceSubdataEditor.tsx`: add `case 'invitation'` to `extractSubdata`; new `InvitationForm` vendor editor (Types rows {name,price}; Designs rows {image upload via `uploadApi.serviceImage`, name, price}; Add-ons rows {name,price}) reusing `Field/Row/AddBtn/RemoveBtn/CurrencyInput`; add to the dispatch JSX; strip `_uploading` from designs in `handleSave` (like florist).
- `components/booking/forms/BookingForms.tsx`: new `InvitationForm` customer form — type checkboxes (multi, show prices), quantity input, needed-by date, design grid (single-select, image + price), add-on checkboxes, wording textarea; compute `total` per the formula; `onChange({ total, summary, payload:{ types, design_id, addons, quantity, needed_by, invitation_text } })`; register `'invitation': InvitationForm` in `BOOKING_FORM_MAP`.

### Optional (local only)
- `DatabaseSeeder.php`: add a sample Invitation vendor + `seedInvitation()` so the category is populated on fresh installs. Not required for the feature; skip touching prod data.

## Verification
1. `php artisan migrate` locally → 5 tables + category row created; `php artisan route:list` unaffected.
2. `npm run build` (or rely on running Vite HMR) — TS clean.
3. Dev server already running (Vite + Laravel :8000). As a vendor in the `invitation` category (create via admin or seeder): open `/dashboard/vendor` → Service Details → add types/designs/add-ons → Save → reload persists.
4. Publish the service → open its public page → the Invitation booking form renders; selecting types/design/add-ons/quantity updates the total correctly; add to cart.
5. Confirm the order: check `order_invitations` row written and the order detail shows in vendor/customer dashboards.
6. Regression: florist/bride-dress flows still work (shared `loadSubData`/booking map untouched besides additions).
7. Verify in-browser with `preview_*` (snapshot + screenshot of both vendor editor and customer form; network check on save + add-to-cart). No production DB/deploy actions.

## File summary
New: 1 migration, 5 models, plus `InvitationForm` in two existing TSX files.
Edited: `Service.php`, `Order.php`, `VendorServiceController.php`, `ServiceController.php`, `CartController.php`, `lib/data.ts`, `lib/types.ts`, `ServiceSubdataEditor.tsx`, `BookingForms.tsx` (+ optional `Icon.tsx`, `DatabaseSeeder.php`).
