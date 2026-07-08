import { useState, useMemo, useRef, useEffect, Component } from 'react';
import type { ReactNode } from 'react';
import { router, usePage } from '@inertiajs/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Icon from '../components/shared/Icon';
import Stars from '../components/shared/Stars';
import { BOOKING_FORM_MAP } from '../components/booking/forms/BookingForms';
import { useStore, useAuthUser } from '../store';
import { CATEGORIES } from '../lib/data';
import { servicesApi, cartApi, reviewsApi, conversationsApi } from '../lib/api';
import type { Service, FormState } from '../lib/types';
import PublicLayout from '../Layouts/PublicLayout';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseJson(v: any): any[] {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string') { try { return JSON.parse(v); } catch { return []; } }
  return [];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeVenue(v: any) {
  if (!v) return undefined;
  if (v.min !== undefined) return v;
  return { min: Number(v.min_people ?? 1), max: Number(v.max_people ?? 100), pricePerPerson: Number(v.price_per_person ?? 0), minCost: Number(v.min_cost ?? 0), location: v.location ?? '' };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeCatering(c: any) {
  if (!c) return undefined;
  const raw = c.cuisines ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { cuisines: raw.map((cu: any, ci: number) => ({ name: cu.cuisine_name ?? cu.name ?? `Cuisine ${ci + 1}`, menus: (cu.menus ?? []).map((m: any) => ({ name: m.name, max: Number(m.max_choices ?? m.max ?? 1), price: Number(m.price ?? 0), items: (m.items ?? []).map((it: any) => typeof it === 'string' ? it : (it.name ?? '')) })) })) };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeFlorist(f: any) {
  if (!f) return undefined;
  if (f.packages?.[0]?.features !== undefined && !f.packages[0].service_florist_id) return f;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const packages = (f.packages ?? []).map((p: any, i: number) => ({ id: String(p.id ?? i), name: p.name ?? `Package ${i + 1}`, price: Number(p.price ?? 0), type: p.type ?? 'fresh', tier: p.tier ?? null, features: parseJson(p.features), images: parseJson(p.images) }));
  if (packages.length === 0) packages.push({ id: 'fp1', name: 'Classic', price: 0, type: 'fresh' as const, features: [], images: [] });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const designs = (f.designs ?? []).map((d: any, i: number) => ({ id: String(d.id ?? i), name: d.name ?? `Design ${i + 1}`, price: Number(d.price ?? 0), image: (parseJson(d.images)[0]) ?? d.image ?? '' }));
  if (designs.length === 0) designs.push({ id: 'fd1', name: 'Classic', price: 0, image: '' });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { packages, colors: (f.colors ?? []).map((c: any) => c.hex_color ?? c), designs, addons: (f.addons ?? []).map((a: any, i: number) => ({ id: String(a.id ?? i), name: a.name, price: Number(a.price_per_unit ?? a.price ?? 0), unit: a.unit ?? 'piece' })) };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeCarHire(c: any) {
  if (!c) return undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hours = (c.hours ?? []).map((h: any, i: number) => ({ id: String(h.id ?? i), label: h.label, price: Number(h.price ?? 0) }));
  if (hours.length === 0) hours.push({ id: 'ch1', label: 'Full day', price: 0 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addons = (c.addons ?? []).map((a: any, i: number) => ({ id: String(a.id ?? i), name: a.name, image: a.image_url ?? a.image ?? '' }));
  return { hours, addons };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizePhotography(p: any) {
  if (!p) return undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const packages = (p.packages ?? []).map((pkg: any, i: number) => ({ id: String(pkg.id ?? i), name: pkg.package_name ?? pkg.name ?? `Package ${i + 1}`, price: Number(pkg.price ?? 0), includes: parseJson(pkg.includes), addons: (pkg.addons ?? []).map((a: any, j: number) => ({ id: String(a.id ?? j), name: a.name, price: Number(a.price ?? 0) })) }));
  if (packages.length === 0) packages.push({ id: 'p1', name: 'Standard Package', price: 0, includes: [], addons: [] });
  return { packages };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeMusic(m: any) {
  if (!m) return undefined;
  if (m.pricePerHour !== undefined) return m;
  return { pricePerHour: Number(m.price_per_hour ?? 0), minimumHours: Number(m.minimum_hours ?? 1), videoUrl: m.video_url ?? '' };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeBrideDress(b: any) {
  if (!b) return undefined;
  if (b.priceRent !== undefined) return b;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { priceRent: Number(b.price_rent ?? 0), priceBuy: Number(b.price_buy ?? 0), sizes: parseJson(b.available_sizes ?? b.sizes), extras: (b.extras ?? []).map((e: any, i: number) => ({ id: String(e.id ?? i), name: e.name, price: Number(e.price ?? 0), image: e.image ?? '' })) };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeSuit(s: any) {
  if (!s) return undefined;
  if (s.priceRent !== undefined) return s;
  return { priceRent: Number(s.price_rent ?? 0), priceBuy: Number(s.price_buy ?? 0), jacket: parseJson(s.jacket_sizes ?? s.jacket), vest: parseJson(s.vest_sizes ?? s.vest), shirt: parseJson(s.shirt_sizes ?? s.shirt), bottom: parseJson(s.bottom_sizes ?? s.bottom) };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeBridesmaid(b: any) {
  if (!b) return undefined;
  if (b.sizes !== undefined) return b;
  return { price: Number(b.price ?? 0), sizes: parseJson(b.available_sizes) };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeFlowerGirl(f: any) {
  if (!f) return undefined;
  if (f.sizes !== undefined) return f;
  return { price: Number(f.price ?? 0), sizes: parseJson(f.age_groups ?? f.available_sizes) };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeYacht(y: any) {
  if (!y) return undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hours = (y.hours ?? []).map((h: any, i: number) => ({ id: String(h.id ?? i), label: h.label, price: Number(h.price ?? 0) }));
  if (hours.length === 0) hours.push({ id: 'y1', label: 'Half day', price: Number(y.price ?? y.minimum_price ?? 0) });
  if (y.min !== undefined && y.hours?.[0]?.id !== undefined) return { ...y, hours };
  return { min: Number(y.min_people ?? 1), max: Number(y.max_people ?? 20), speed: y.speed ?? '', length: y.length ?? '', cabinCrew: Number(y.cabin_crew ?? 0), washroom: Number(y.washroom ?? 0), shower: Number(y.shower ?? 0), chef: Boolean(y.chef_included ?? y.chef), hours };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeBachelor(b: any) {
  if (!b) return undefined;
  if (b.includes !== undefined) return b;
  const acts = [];
  if (b.catamaran_price != null) acts.push({ id: 'bi1', name: 'Catamaran trip', price: Number(b.catamaran_price), icon: 'yacht' });
  if (b.excursion_price != null) acts.push({ id: 'bi2', name: 'Excursions', price: Number(b.excursion_price), icon: 'hiker' });
  if (b.bar_crawl_price != null) acts.push({ id: 'bi3', name: 'Bar Crawl', price: Number(b.bar_crawl_price), icon: 'cocktail' });
  if (b.night_out_price != null) acts.push({ id: 'bi4', name: 'Night Out', price: Number(b.night_out_price), icon: 'glass' });
  return { pricePerHour: Number(b.price_per_hour ?? 0), includes: acts };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeBachelorette(b: any) {
  if (!b) return undefined;
  if (b.includes !== undefined) return b;
  const acts = [];
  if (b.catamaran_price != null) acts.push({ id: 'bbi1', name: 'Catamaran trip', price: Number(b.catamaran_price), icon: 'yacht' });
  if (b.excursion_price != null) acts.push({ id: 'bbi2', name: 'Excursions', price: Number(b.excursion_price), icon: 'hiker' });
  if (b.bar_crawl_price != null) acts.push({ id: 'bbi3', name: 'Bar Crawl', price: Number(b.bar_crawl_price), icon: 'cocktail' });
  if (b.night_out_price != null) acts.push({ id: 'bbi4', name: 'Night Out', price: Number(b.night_out_price), icon: 'glass' });
  if (b.spa_day_price != null) acts.push({ id: 'bbi5', name: 'Spa Day', price: Number(b.spa_day_price), icon: 'spa' });
  return { pricePerHour: Number(b.price_per_hour ?? 0), includes: acts };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeHotel(h: any) {
  if (!h) return undefined;
  if (h.rooms?.[0]?.pricePerNight !== undefined) return h;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { rooms: (h.rooms ?? []).map((r: any, i: number) => ({ id: String(r.id ?? i), name: r.room_type ?? r.name, pricePerNight: Number(r.price_per_night ?? r.pricePerNight ?? 0), maxAdults: Number(r.max_adults ?? r.maxAdults ?? 2), maxKids: Number(r.max_kids ?? r.maxKids ?? 0), images: parseJson(r.images) })), facilities: (h.facilities ?? []).map((f: any, i: number) => ({ id: String(f.id ?? i), name: f.name, price: Number(f.price ?? 0) })) };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeBar(b: any) {
  if (!b) return undefined;
  if (b.menus?.[0]?.id !== undefined && typeof b.menus[0].items?.[0] === 'string') return b;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { menus: (b.menus ?? []).map((m: any, i: number) => ({ id: String(m.id ?? i), name: m.name, price: Number(m.price ?? 0), items: (m.items ?? []).map((it: any) => it.name ?? it) })) };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeHair(h: any) {
  if (!h) return undefined;
  if (h.pricing_mode === 'packages' || (h.packages !== undefined && Array.isArray(h.packages) && h.packages.length > 0 && h.packages[0]?.name !== undefined)) {
    const pkgs = (h.packages ?? []).map((p: any, i: number) => ({
      id: p.id ?? `hpkg-${i}`,
      name: p.name ?? '',
      price: Number(p.price ?? 0),
      blurb: '',
      tier: p.tier ?? null,
      features: Array.isArray(p.features) ? p.features : [],
      images: Array.isArray(p.images) ? p.images : [],
    }));
    return { packages: pkgs };
  }
  const pkgs: any[] = [];
  if (h.price_bridal != null && Number(h.price_bridal) > 0) pkgs.push({ id: 'hp1', name: 'Bridal Hair', price: Number(h.price_bridal), blurb: 'Stunning bridal updo or style for your wedding day', tier: null, features: [], images: [] });
  if (h.price_after_wedding != null && Number(h.price_after_wedding) > 0) pkgs.push({ id: 'hp2', name: 'After-Wedding Hair', price: Number(h.price_after_wedding), blurb: 'Refreshed look for post-wedding events', tier: null, features: [], images: [] });
  if (h.price_party != null && Number(h.price_party) > 0) pkgs.push({ id: 'hp3', name: "Hen's Party Hair", price: Number(h.price_party), blurb: 'Glamorous styles for you and your party', tier: null, features: [], images: [] });
  if (h.price_trial_1 != null && Number(h.price_trial_1) > 0) pkgs.push({ id: 'hp4', name: 'Trial 1', price: Number(h.price_trial_1), blurb: 'First practice session to perfect your style', tier: null, features: [], images: [] });
  if (h.price_trial_2 != null && Number(h.price_trial_2) > 0) pkgs.push({ id: 'hp5', name: 'Trial 2', price: Number(h.price_trial_2), blurb: 'Second refinement session before the big day', tier: null, features: [], images: [] });
  return { packages: pkgs };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeMakeup(m: any) {
  if (!m) return undefined;
  // makeup config: packages, per-city travel fees, and optional add-ons
  let rawLoc = m.location_prices;
  if (typeof rawLoc === 'string') { try { rawLoc = JSON.parse(rawLoc); } catch { rawLoc = null; } }
  const locationPrices: Record<string, number> = rawLoc && typeof rawLoc === 'object'
    ? Object.fromEntries(Object.entries(rawLoc).map(([k, v]) => [k, Number(v) || 0]))
    : {};
  let rawAddons = m.addons;
  if (typeof rawAddons === 'string') { try { rawAddons = JSON.parse(rawAddons); } catch { rawAddons = null; } }
  const addons = Array.isArray(rawAddons)
    ? rawAddons.map((a: any, i: number) => ({ id: String(a.id ?? `ma-${i}`), name: a.name ?? '', price: Number(a.price) || 0 }))
    : [];
  // Packages mode — normalize each package to include tier, features, images
  if (m.pricing_mode === 'packages' || (m.packages !== undefined && Array.isArray(m.packages) && m.packages.length > 0 && m.packages[0]?.name !== undefined)) {
    const pkgs = (m.packages ?? []).map((p: any, i: number) => ({
      id: p.id ?? `pkg-${i}`,
      name: p.name ?? '',
      price: Number(p.price ?? 0),
      blurb: '',
      tier: p.tier ?? null,
      features: Array.isArray(p.features) ? p.features : [],
      images: Array.isArray(p.images) ? p.images : [],
    }));
    return { packages: pkgs, locationPrices, addons };
  }
  // Regular mode — build synthetic packages from flat price fields
  const pkgs: any[] = [];
  if (m.price_bridal != null && Number(m.price_bridal) > 0) pkgs.push({ id: 'mp1', name: 'Wedding Day Bridal Make-up', price: Number(m.price_bridal), blurb: 'Full glam look for your special day', tier: null, features: [], images: [] });
  if (m.price_after_wedding != null && Number(m.price_after_wedding) > 0) pkgs.push({ id: 'mp2', name: 'Photo-shoot After the Wedding', price: Number(m.price_after_wedding), blurb: 'Touch-up & fresh look for post-wedding shoot', tier: null, features: [], images: [] });
  if (m.price_party != null && Number(m.price_party) > 0) pkgs.push({ id: 'mp3', name: "Hen's Party Make-Up", price: Number(m.price_party), blurb: 'Glam looks for you and your party', tier: null, features: [], images: [] });
  if (m.price_trial_1 != null && Number(m.price_trial_1) > 0) pkgs.push({ id: 'mp4', name: 'Trial 1', price: Number(m.price_trial_1), blurb: 'First practice session to perfect your look', tier: null, features: [], images: [] });
  if (m.price_trial_2 != null && Number(m.price_trial_2) > 0) pkgs.push({ id: 'mp5', name: 'Trial 2', price: Number(m.price_trial_2), blurb: 'Second refinement session before the big day', tier: null, features: [], images: [] });
  return { packages: pkgs, locationPrices, addons };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeInvitation(iv: any) {
  if (!iv) return undefined;
  // Already normalized (camelCase shape from a previous pass)
  if (Array.isArray(iv.types) && iv.types[0]?.id !== undefined && iv.types[0]?.service_invitation_id === undefined) return iv;
  return {
    types:   (iv.types ?? []).map((t: any, i: number) => ({ id: String(t.id ?? i), name: t.name ?? '', price: Number(t.price ?? 0) })),
    designs: (iv.designs ?? []).map((dz: any, i: number) => ({ id: String(dz.id ?? i), name: dz.name ?? '', image: dz.image ?? '', price: Number(dz.price ?? 0) })),
    addons:  (iv.addons ?? []).map((a: any, i: number) => ({ id: String(a.id ?? i), name: a.name ?? '', price: Number(a.price ?? 0) })),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeCakeDessert(c: any) {
  if (!c) return undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const arr = (v: any): any[] => {
    if (typeof v === 'string') { try { return JSON.parse(v); } catch { return []; } }
    return Array.isArray(v) ? v : [];
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = (rows: any, withImage: boolean) => arr(rows).map((r: any, i: number) => ({
    id: String(r.id ?? `cd-${i}`), name: r.name ?? '', price: Number(r.price) || 0,
    ...(withImage ? { image: r.image ?? '' } : {}),
  }));
  return {
    flavors: arr(c.flavors).map((f: unknown) => String(f)),
    maxLayers: Number(c.max_layers) || 5,
    cakeBasePrice: Number(c.cake_base_price) || 0,
    cakeLayerPrice: Number(c.cake_layer_price) || 0,
    desserts: items(c.desserts, true),
    addons: items(c.addons, false),
    tastingBoxes: items(c.tasting_boxes, false),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeService(s: any): Service {
  return {
    id: s.id, slug: s.category?.slug ?? s.slug ?? '',
    vendorId: s.vendor_id ?? s.vendor?.id ?? 0,
    vendor: s.vendor?.vendor_profile?.business_name ?? s.vendor?.vendorProfile?.business_name ?? s.vendor?.name ?? '',
    title: s.title, location: s.location ?? '',
    images: Array.isArray(s.images) ? s.images.map((img: { url: string } | string) => typeof img === 'string' ? img : img.url).filter(Boolean) : [],
    blockedDates: Array.isArray(s.blocked_dates) ? s.blocked_dates.filter(Boolean) : [],
    minimum_price: Number(s.minimum_price) || 0, rating: Number(s.rating) || 0,
    reviews: s.review_count ?? 0, featured: s.is_featured ?? false, description: s.description ?? '',
    venue: normalizeVenue(s.venue), catering: normalizeCatering(s.catering), florist: normalizeFlorist(s.florist),
    carHire: normalizeCarHire(s.car_hire ?? s.carHire), photography: normalizePhotography(s.photography),
    music: normalizeMusic(s.music), brideDress: normalizeBrideDress(s.bride_dress ?? s.brideDress),
    groomSuite: normalizeSuit(s.groom_suite ?? s.groomSuite), bestMan: normalizeSuit(s.best_man_suit ?? s.bestManSuit ?? s.best_man),
    bridesmaid: normalizeBridesmaid(s.bridesmaid_dress ?? s.bridesmaid), flowerGirl: normalizeFlowerGirl(s.flower_girl_dress ?? s.flowerGirl),
    yacht: normalizeYacht(s.yacht_hire ?? s.yacht), bachelor: normalizeBachelor(s.bachelor),
    bachelorette: normalizeBachelorette(s.bachelorette), hotel: normalizeHotel(s.accommodation ?? s.hotel),
    bar: normalizeBar(s.bar), makeup: normalizeMakeup(s.makeup), hair: normalizeHair(s.hair),
    invitation: normalizeInvitation(s.invitation),
    cakeDessert: normalizeCakeDessert(s.cake_dessert ?? s.cakeDessert),
  };
}

class FormErrorBoundary extends Component<{ children: ReactNode }, { err: boolean }> {
  state = { err: false };
  static getDerivedStateFromError() { return { err: true }; }
  render() {
    if (this.state.err)
      return <p className="muted text-14" style={{ padding: '20px 0' }}>Booking form could not be loaded. Please check back later.</p>;
    return this.props.children;
  }
}

function Gallery({ images, active, setActive }: { images: string[]; active: number; setActive: (i: number) => void }) {
  return (
    <div>
      <div style={{ aspectRatio: '16/10', borderRadius: 20, overflow: 'hidden', background: 'var(--bg-3)' }}>
        <img src={images[active]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      {images.length > 1 && (
        <div className="flex gap-8 mt-12">
          {images.map((im, i) => (
            <button key={i} onClick={() => setActive(i)}
              style={{ width: 96, height: 64, borderRadius: 12, overflow: 'hidden', border: active === i ? '2px solid var(--primary)' : '2px solid transparent', cursor: 'pointer', padding: 0, background: 'transparent' }}>
              <img src={im} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function BookingPanel({ cat, formState, date, setDate, onReserve, minDate, blockedDates, added, serviceTitle, onContactVendor, contactingVendor }: {
  cat: { name: string } | undefined;
  formState: FormState; date: string; setDate: (d: string) => void; onReserve: () => void;
  minDate?: string; blockedDates?: string[]; added?: boolean; serviceTitle?: string;
  onContactVendor?: () => void; contactingVendor?: boolean;
}) {
  const total = formState.total || 0;
  const dateBlocked = !!date && !!blockedDates?.includes(date);
  const showToast = useStore((s) => s.showToast);
  const copyToClipboard = async (text: string): Promise<boolean> => {
    // navigator.clipboard is unavailable outside secure contexts (e.g. http LAN IP),
    // so fall back to a hidden textarea + execCommand.
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch { /* fall through to legacy path */ }
    }
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  };
  const copyLink = async () => {
    const ok = await copyToClipboard(window.location.href);
    showToast(ok ? 'Link copied to clipboard!' : 'Could not copy link.', ok ? 'success' : 'error');
  };
  return (
    <div className="booking-panel">
      <div className="panel-title">
        <span className="chip chip-soft">{cat?.name}</span>
        <button className="btn btn-ghost btn-sm" title="Copy link" onClick={copyLink}><Icon name="copy" size={14} /></button>
      </div>
      <div className="mt-16">
        <div className="text-12 muted fw-600">Booking date</div>
        <input type="date" className="input mt-4" value={date} min={minDate} onChange={(e) => setDate(e.target.value)} />
        {dateBlocked
          ? <div className="text-11 mt-4" style={{ color: '#E11D48' }}>⚠ This date is unavailable — please pick another</div>
          : date && minDate && date < minDate
            ? <div className="text-11 mt-4" style={{ color: '#E11D48' }}>⚠ Please select a future date</div>
            : date
              ? <div className="text-11 mt-4" style={{ color: 'var(--primary)' }}>✓ Date selected</div>
              : <div className="text-11 mt-4 muted">Earliest available: {minDate}</div>
        }
        {blockedDates && blockedDates.length > 0 && (
          <div className="text-11 mt-8 muted">
            Unavailable: {blockedDates.slice().sort().join(', ')}
          </div>
        )}
      </div>
      {(formState.items?.length || formState.summary) ? (
        <div className="mt-16" style={{ background: 'var(--bg-2)', borderRadius: 12, padding: 14 }}>
          <div className="text-12 muted fw-600">Includes</div>
          {formState.items?.length ? (
            <div className="mt-8" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {formState.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{item.label}</span>
                  {item.detail && <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>{item.detail}</span>}
                </div>
              ))}
            </div>
          ) : (
            <div className="fw-600 text-13 mt-4">{formState.summary}</div>
          )}
        </div>
      ) : null}
      <hr />
      <div className="flex items-center justify-between">
        <span className="muted text-13">Total amount</span>
        <span className="total">€{total.toLocaleString()}</span>
      </div>
      <button className="btn btn-primary btn-block btn-lg mt-16" onClick={onReserve} disabled={!total || formState.valid === false || added || dateBlocked}>
        {added ? '✓ Added to cart' : 'Reserve'}
      </button>
      <button className="btn btn-ghost btn-block mt-8" onClick={onContactVendor} disabled={contactingVendor}>
        <Icon name="msg" size={16} /> {contactingVendor ? 'Opening chat…' : 'Contact vendor'}
      </button>
      <hr />
      <div className="text-12 muted">Share this service</div>
      <div className="flex gap-8 mt-12">
        {([
          { name: 'facebook'  as const, url: (u: string) => `https://www.facebook.com/sharer/sharer.php?u=${u}` },
          { name: 'twitter'   as const, url: (u: string, t: string) => `https://x.com/intent/post?url=${u}&text=${t}` },
          { name: 'instagram' as const, url: null },
          { name: 'whatsapp'  as const, url: (u: string, t: string) => `https://wa.me/?text=${t}%20${u}` },
        ]).map(({ name, url }) => (
          <button key={name} className="btn btn-sm" title={name === 'instagram' ? 'Copy link for Instagram' : `Share on ${name}`}
            style={{ background: 'var(--bg-3)', color: 'var(--ink-2)', padding: 8, borderRadius: 10 }}
            onClick={() => {
              if (!url) {
                // Instagram has no web share intent — copy the link instead
                copyToClipboard(window.location.href).then((ok) =>
                  showToast(ok ? 'Link copied — paste it on Instagram!' : 'Could not copy link.', ok ? 'success' : 'error'));
                return;
              }
              const pageUrl = encodeURIComponent(window.location.href);
              const title   = encodeURIComponent(serviceTitle ?? 'Check out this wedding service on WedBox');
              window.open(url(pageUrl, title), '_blank', 'noopener,noreferrer,width=600,height=500');
            }}>
            <Icon name={name} size={14} />
          </button>
        ))}
      </div>
    </div>
  );
}

function CategoryQuickSwitch({ currentSlug }: { currentSlug: string }) {
  const [expanded, setExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(CATEGORIES.length);
  const rowRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  // Measure how many chips fit in one row
  useEffect(() => {
    const measure = () => {
      const row = rowRef.current;
      const ghost = measureRef.current;
      if (!row || !ghost) return;
      const rowW = row.offsetWidth;
      const chips = Array.from(ghost.querySelectorAll<HTMLElement>('.qs-chip'));
      const moreW = 80; // reserved for "+N more" button
      let used = 0;
      let count = 0;
      for (const chip of chips) {
        const w = chip.offsetWidth + 8; // 8 = gap
        if (used + w + moreW > rowW) break;
        used += w;
        count++;
      }
      setVisibleCount(Math.max(1, count));
    };

    measure();
    const ro = new ResizeObserver(measure);
    if (rowRef.current) ro.observe(rowRef.current);
    return () => ro.disconnect();
  }, []);

  const hidden = CATEGORIES.length - visibleCount;

  return (
    <div className="card" style={{ position: 'relative', padding: '10px 12px', background: 'var(--bg-2)', border: 0, overflow: 'hidden' }}>
      {/* Invisible ghost row used only for measurement — never wraps.
          Parent must be position:relative so this absolute row is clipped by overflow:hidden
          instead of expanding the page width on narrow viewports. */}
      <div ref={measureRef} style={{ position: 'absolute', top: 0, left: 0, visibility: 'hidden', pointerEvents: 'none', display: 'flex', gap: 8, whiteSpace: 'nowrap' }}>
        {CATEGORIES.map((c) => (
          <span key={c.slug} className="chip chip-selectable qs-chip" style={{ whiteSpace: 'nowrap' }}>
            <Icon name={c.icon || 'diamond'} size={12} /> {c.name}
          </span>
        ))}
      </div>

      {/* Visible single row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="text-12 muted fw-600" style={{ paddingLeft: 6, paddingRight: 6, whiteSpace: 'nowrap', flexShrink: 0 }}>BROWSE:</span>
        <div ref={rowRef} style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden', flexWrap: 'nowrap', flex: 1 }}>
          {CATEGORIES.slice(0, visibleCount).map((c) => {
            const on = c.slug === currentSlug;
            return (
              <button key={c.slug} onClick={() => router.visit(`/search?category=${c.slug}`)} className="chip chip-selectable"
                style={{ background: on ? 'var(--primary)' : 'white', color: on ? 'white' : 'var(--ink-2)', border: `1px solid ${on ? 'var(--primary)' : 'var(--line)'}`, whiteSpace: 'nowrap', flexShrink: 0 }}>
                <Icon name={c.icon || 'diamond'} size={12} /> {c.name}
              </button>
            );
          })}
        </div>
        {hidden > 0 && (
          <button
            className="chip chip-selectable"
            style={{ background: 'transparent', color: 'var(--primary)', border: '1px dashed var(--primary)', whiteSpace: 'nowrap', fontWeight: 600, flexShrink: 0 }}
            onClick={() => setExpanded((e) => !e)}>
            {expanded ? '↑ Less' : `+${hidden} more`}
          </button>
        )}
      </div>

      {/* Expanded overflow row */}
      {expanded && hidden > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--line)' }}>
          {CATEGORIES.slice(visibleCount).map((c) => {
            const on = c.slug === currentSlug;
            return (
              <button key={c.slug} onClick={() => router.visit(`/search?category=${c.slug}`)} className="chip chip-selectable"
                style={{ background: on ? 'var(--primary)' : 'white', color: on ? 'white' : 'var(--ink-2)', border: `1px solid ${on ? 'var(--primary)' : 'var(--line)'}`, whiteSpace: 'nowrap' }}>
                <Icon name={c.icon || 'diamond'} size={12} /> {c.name}
              </button>
            );
          })}
          <button
            className="chip chip-selectable"
            style={{ background: 'transparent', color: 'var(--muted)', border: '1px solid var(--line)', whiteSpace: 'nowrap', fontWeight: 600 }}
            onClick={() => setExpanded(false)}>
            ↑ Show less
          </button>
        </div>
      )}
    </div>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-4" style={{ cursor: 'pointer' }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ fontSize: 24, color: (hover || value) >= n ? '#F59E0B' : 'var(--line)' }}
          onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}>★</span>
      ))}
    </div>
  );
}

function ReviewsBlock({ service, rawReviews = [], userHasOrdered = false }: { service: Service; rawReviews?: unknown[]; userHasOrdered?: boolean }) {
  const user = useAuthUser();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const reviewMutation = useMutation({
    mutationFn: () => reviewsApi.post({ service_id: service.id, rating, comment }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['service', service.id] });
      setSubmitted(true); setShowForm(false); setComment(''); setRating(5);
    },
  });

  useEffect(() => {
    if (showForm) formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [showForm]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiReviews: any[] = rawReviews as any[];
  const displayReviews = apiReviews.map((r) => ({
    name: r.user?.profile?.first_name ? `${r.user.profile.first_name} ${r.user.profile.last_name ?? ''}`.trim() : r.user?.name ?? 'Anonymous',
    rating: r.rating, text: r.comment ?? '', avatar: r.user?.profile?.avatar_url ?? '',
  }));

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 style={{ fontSize: 20 }}>Reviews</h3>
        {user && userHasOrdered && !submitted && (
          <button className="btn btn-soft btn-sm" onClick={() => setShowForm((v) => !v)}>{showForm ? 'Cancel' : 'Write a review'}</button>
        )}
        {user && !userHasOrdered && !submitted && (
          <span className="muted text-13">Reserve this service to leave a review</span>
        )}
        {!user && <span className="muted text-13">Sign in to leave a review</span>}
        {submitted && <span className="text-13" style={{ color: '#059669' }}>✓ Review submitted!</span>}
      </div>
      <div className="flex items-center gap-12 mt-12">
        <Stars value={service.rating} size={18} />
        <span className="fw-700">{service.rating.toFixed(1)}</span>
        <span className="muted">({service.reviews} reviews)</span>
      </div>
      {showForm && (
        <div ref={formRef} className="card card-pad mt-16" style={{ border: '1px solid var(--primary-200)' }}>
          <div className="fw-700 text-14 mb-8">Your rating</div>
          <StarPicker value={rating} onChange={setRating} />
          <div className="mt-12">
            <label className="field-label">Your review (optional)</label>
            <textarea className="textarea mt-8" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience with this vendor…" />
          </div>
          {reviewMutation.isError && <p className="mt-8 text-13" style={{ color: '#E11D48' }}>Something went wrong. Please try again.</p>}
          <div className="flex gap-8 mt-12" style={{ justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={() => reviewMutation.mutate()} disabled={reviewMutation.isPending || rating < 1}>
              {reviewMutation.isPending ? 'Submitting…' : 'Submit review'}
            </button>
          </div>
        </div>
      )}
      {displayReviews.length === 0 && <p className="muted text-14 mt-20">No reviews yet. Be the first to leave one!</p>}
      <div className="grid r-grid-3 mt-20" style={{ gap: 14 }}>
        {displayReviews.map((r, i) => (
          <div key={i} className="card card-pad">
            <div className="flex items-center gap-10">
              {r.avatar
                ? <img src={r.avatar} alt="" style={{ width: 36, height: 36, borderRadius: 999, objectFit: 'cover' }} />
                : <div style={{ width: 36, height: 36, borderRadius: 999, background: 'var(--primary-50)', color: 'var(--primary-700)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 15 }}>{r.name[0]}</div>
              }
              <div>
                <div className="fw-700 text-13">{r.name}</div>
                <Stars value={r.rating} size={12} />
              </div>
            </div>
            <p className="mt-12 text-14 muted" style={{ lineHeight: 1.55 }}>{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ServicePageProps {
  serviceId?: number;
}

export default function ServicePage({ serviceId }: ServicePageProps) {
  const pageProps = usePage().props as ServicePageProps;
  const id = serviceId ?? pageProps.serviceId;
  const numId = Number(id);

  const { data: apiData, isError, isLoading } = useQuery({
    queryKey: ['service', numId],
    queryFn: () => servicesApi.show(numId),
    retry: false,
    staleTime: 60_000,
    enabled: !!numId,
  });

  const service: Service | null = useMemo(() => {
    if (apiData && !isError) return normalizeService(apiData);
    return null;
  }, [apiData, isError]);

  useEffect(() => {
    if (service?.title) document.title = `${service.title} | WedBox`;
    return () => { document.title = 'WedBox'; };
  }, [service?.title]);

  const [formState, setFormState] = useState<FormState>({ total: 0, summary: '', payload: {} });
  const [activeImage, setActiveImage] = useState(0);
  const [date, setDate] = useState('');
  const [addedToCart, setAddedToCart] = useState(false);
  const [initialPayload, setInitialPayload] = useState<Record<string, unknown> | undefined>(undefined);

  // Read back saved selections when arriving from the cart
  useEffect(() => {
    if (!numId) return;
    const key = `wedbox_cart_payload_${numId}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) { setInitialPayload(JSON.parse(raw)); localStorage.removeItem(key); }
    } catch { /* ignore */ }
  }, [numId]);
  const { favorites, toggleFav, addToCart, showToast } = useStore();
  const tomorrow = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, []);
  const user = useAuthUser();
  const qc = useQueryClient();

  const addToCartMutation = useMutation({
    mutationFn: (d: Parameters<typeof cartApi.add>[0]) => cartApi.add(d),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });

  const contactVendorMutation = useMutation({
    mutationFn: (d: { vendor_id: number; service_id?: number }) => conversationsApi.create(d),
    onSuccess: (conversation: { id: number }) => router.visit(`/dashboard/buyer/messages?conversation=${conversation.id}`),
    onError: () => showToast('Could not start the conversation. Please try again.', 'error'),
  });

  const content = () => {
    if (isLoading) return (
      <div className="container-wide" style={{ padding: '60px 28px', textAlign: 'center' }}>
        <div className="muted">Loading service…</div>
      </div>
    );

    if (!service || isError) return (
      <div className="container-wide" style={{ padding: '80px 28px', textAlign: 'center' }}>
        <h2>Service not found</h2>
        <p className="muted mt-12">This service may no longer be available.</p>
        <a href="/search" className="btn btn-primary mt-20">Browse services</a>
      </div>
    );

    const cat = CATEGORIES.find((c) => c.slug === service.slug);
    const FormComponent = BOOKING_FORM_MAP[service.slug];
    const fav = favorites.has(service.id);
    const images = service.images.length > 0 ? service.images : [];
    // Sub-data keys that each form requires; if null the vendor hasn't filled them in yet
    const SUB_DATA_KEYS: Partial<Record<string, keyof Service>> = {
      venue: 'venue', catering: 'catering', florist: 'florist', 'car-hire': 'carHire',
      photography: 'photography', music: 'music', 'bride-dress': 'brideDress',
      'groom-suite': 'groomSuite', 'best-man': 'bestMan', bridesmaid: 'bridesmaid',
      'flower-girl': 'flowerGirl', 'yacht': 'yacht', bachelor: 'bachelor',
      bachelorette: 'bachelorette', hotel: 'hotel', bar: 'bar', 'makeup': 'makeup',
      'invitation': 'invitation', 'cake-desserts': 'cakeDessert',
    };
    const subKey = SUB_DATA_KEYS[service.slug];
    const hasSubData = !subKey || service[subKey] != null;
    // Extract reviews array from raw API response (normalized service only keeps the count)
    const rawReviews: unknown[] = Array.isArray((apiData as any)?.reviews) ? (apiData as any).reviews : [];
    const userHasOrdered: boolean = (apiData as any)?.user_has_ordered ?? false;

    return (
      <div className="container-wide fade-up" style={{ padding: '24px 28px 64px' }}>
        <CategoryQuickSwitch currentSlug={service.slug} />
        <div className="grid r-grid-detail" style={{ gap: 36, marginTop: 24 }}>
          <div>
            {images.length > 0
              ? <Gallery images={images} active={Math.min(activeImage, images.length - 1)} setActive={setActiveImage} />
              : <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: 20, background: 'var(--bg-3)' }} />
            }
            <div className="flex items-center justify-between mt-20" style={{ flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div className="flex items-center gap-8">
                  <span className="chip chip-soft">{cat?.name}</span>
                  <span className="muted text-13 flex items-center gap-4"><Icon name="location" size={14} /> {service.location}</span>
                </div>
                <h1 style={{ fontSize: 36, marginTop: 10 }}>{service.title}</h1>
                <div className="flex items-center gap-12 mt-8">
                  <Stars value={service.rating} />
                  <span className="fw-700">{service.rating}</span>
                  <span className="muted">({service.reviews} reviews)</span>
                  <span className="muted">·</span>
                  <span className="muted text-14">by {service.vendor}</span>
                </div>
              </div>
              <button onClick={() => toggleFav(service.id)} className="btn btn-soft" style={{ borderRadius: 999 }}>
                <Icon name={fav ? 'heart-filled' : 'heart'} size={16} color={fav ? '#E11D48' : 'currentColor'} />
                {fav ? 'Saved' : 'Add to favorites'}
              </button>
            </div>
            <hr className="divider mt-20 mb-20" />
            <h3 style={{ fontSize: 20 }}>About this service</h3>
            <p className="muted mt-12" style={{ fontSize: 15, lineHeight: 1.65, maxWidth: 720 }}>{service.description}</p>
            <hr className="divider mt-24 mb-24" />
            <h3 style={{ fontSize: 20, marginBottom: 16 }}>Customize your booking</h3>
            {FormComponent && hasSubData
              ? <div className="booking-form"><FormErrorBoundary><FormComponent service={service} onChange={setFormState} initialPayload={initialPayload} /></FormErrorBoundary></div>
              : <p className="muted text-14" style={{ padding: '12px 0' }}>Booking details are being set up by the vendor — check back soon.</p>
            }
            <hr className="divider mt-32 mb-24" />
            <ReviewsBlock service={service} rawReviews={rawReviews} userHasOrdered={userHasOrdered} />
          </div>
          <aside>
            <BookingPanel cat={cat} formState={formState} date={date} setDate={setDate}
              minDate={tomorrow} blockedDates={service.blockedDates} added={addedToCart} serviceTitle={service?.title}
              onReserve={async () => {
                if (user && apiData && !isError) {
                  try {
                    await addToCartMutation.mutateAsync({
                      service_id: service.id, order_type: service.slug,
                      price: formState.total, deliver_date: date || undefined,
                      note: formState.summary || undefined,
                      order_details: formState.payload as Record<string, unknown>,
                    });
                    localStorage.setItem(`wedbox_cart_payload_${service.id}`, JSON.stringify(formState.payload));
                    setAddedToCart(true);
                    showToast('Added to your cart!');
                  } catch {
                    showToast('Could not add to cart. Please try again.', 'error');
                  }
                } else {
                  addToCart({ serviceId: service.id, price: formState.total, detailSummary: formState.summary, payload: formState.payload, date, serviceTitle: service.title, serviceImage: service.images[0] ?? '' });
                  localStorage.setItem(`wedbox_cart_payload_${service.id}`, JSON.stringify(formState.payload));
                  setAddedToCart(true);
                  showToast('Added to your cart!');
                }
              }}
              contactingVendor={contactVendorMutation.isPending}
              onContactVendor={() => {
                if (!user) { router.visit('/auth'); return; }
                if (!service.vendorId) { showToast('Could not start the conversation. Please try again.', 'error'); return; }
                contactVendorMutation.mutate({ vendor_id: service.vendorId, service_id: service.id });
              }} />
          </aside>
        </div>
      </div>
    );
  };

  return <PublicLayout>{content()}</PublicLayout>;
}
