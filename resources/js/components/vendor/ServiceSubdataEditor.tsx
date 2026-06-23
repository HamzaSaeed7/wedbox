/**
 * ServiceSubdataEditor
 * Category-specific detail forms for the vendor service page.
 * Renders the right form based on category slug, pre-fills from API data,
 * and calls onSave(data) when the vendor clicks Save.
 */
import { useState, useEffect } from 'react';
import Icon from '../shared/Icon';
import CurrencyInput from '../shared/CurrencyInput';
import { uploadApi } from '../../lib/api';

// ─── Small reusable pieces ────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <div className="mt-4">{children}</div>
    </div>
  );
}
function Row({ children, cols = 2 }: { children: React.ReactNode; cols?: number }) {
  return <div className="grid mt-12" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12 }}>{children}</div>;
}
function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mt-24 mb-12" style={{ borderBottom: '1px solid var(--line)', paddingBottom: 8 }}>
      <div className="fw-700" style={{ fontSize: 15 }}>{title}</div>
      {sub && <div className="muted text-12 mt-2">{sub}</div>}
    </div>
  );
}
function AddBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="btn btn-ghost btn-sm mt-10"
      style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary)' }}
      onClick={onClick}>
      <Icon name="plus" size={12} /> {label}
    </button>
  );
}
function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      style={{ background: 'transparent', border: 0, color: '#E11D48', cursor: 'pointer', padding: '0 4px' }}>
      <Icon name="close" size={12} />
    </button>
  );
}

/** Tag chip input: type + Enter to add, × to remove */
function TagInput({ tags, onChange, placeholder = 'Type and press Enter' }: { tags: string[]; onChange: (t: string[]) => void; placeholder?: string }) {
  const [val, setVal] = useState('');
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 10, background: 'var(--bg-2)', minHeight: 42 }}>
      {tags.map((t, i) => (
        <span key={i} className="chip" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {t}
          <button type="button" onClick={() => onChange(tags.filter((_, j) => j !== i))}
            style={{ background: 'transparent', border: 0, cursor: 'pointer', lineHeight: 1, padding: 0, color: 'var(--muted)' }}>×</button>
        </span>
      ))}
      <input value={val} placeholder={placeholder} onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && val.trim()) { e.preventDefault(); onChange([...tags, val.trim()]); setVal(''); } }}
        style={{ border: 0, outline: 'none', background: 'transparent', minWidth: 120, fontSize: 13 }} />
    </div>
  );
}

/** Color swatch picker: hex input + preview */
function ColorInput({ colors, onChange }: { colors: string[]; onChange: (c: string[]) => void }) {
  const [val, setVal] = useState('');
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      {colors.map((c, i) => (
        <div key={i} style={{ position: 'relative' }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: c, border: '2px solid var(--line)', cursor: 'pointer' }}
            title={c} onClick={() => onChange(colors.filter((_, j) => j !== i))} />
          <div style={{ position: 'absolute', top: -4, right: -4, width: 14, height: 14, borderRadius: 999, background: '#E11D48', color: 'white', fontSize: 9, display: 'grid', placeItems: 'center', cursor: 'pointer' }}
            onClick={() => onChange(colors.filter((_, j) => j !== i))}>×</div>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <input type="color" value={val || '#ffffff'} onChange={(e) => setVal(e.target.value)}
          style={{ width: 36, height: 36, border: '1px solid var(--line)', borderRadius: 8, padding: 2, cursor: 'pointer' }} />
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => { if (val) { onChange([...colors, val]); setVal(''); } }}>
          Add
        </button>
      </div>
    </div>
  );
}

// ─── 1. Venue ─────────────────────────────────────────────────────────────────
function VenueForm({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const s = data ?? {};
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...s, [k]: e.target.value });
  return (
    <div>
      <Row cols={2}>
        <Field label="Min guests"><input className="input" type="number" value={s.min_people ?? ''} onChange={set('min_people')} placeholder="30" /></Field>
        <Field label="Max guests"><input className="input" type="number" value={s.max_people ?? ''} onChange={set('max_people')} placeholder="300" /></Field>
      </Row>
      <Row cols={2}>
        <Field label="Price per person (€)"><CurrencyInput value={s.price_per_person ?? ''} onChange={set('price_per_person')} placeholder="85" /></Field>
        <Field label="Minimum package cost (€)"><CurrencyInput value={s.min_cost ?? ''} onChange={set('min_cost')} placeholder="5500" /></Field>
      </Row>
      <div className="mt-12">
        <Field label="Venue address"><input className="input" value={s.location ?? ''} onChange={set('location')} placeholder="e.g. Olive Grove Estate, Paphos" /></Field>
      </div>
    </div>
  );
}

// ─── 2. Catering ──────────────────────────────────────────────────────────────
function CateringForm({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const cuisines: any[] = data?.cuisines ?? [];
  const setCuisines = (c: any[]) => onChange({ ...data, cuisines: c });

  const addCuisine = () => setCuisines([...cuisines, { cuisine_name: '', menus: [] }]);
  const removeCuisine = (i: number) => setCuisines(cuisines.filter((_, j) => j !== i));
  const updateCuisine = (i: number, key: string, val: any) => setCuisines(cuisines.map((c, j) => j === i ? { ...c, [key]: val } : c));

  const addMenu = (ci: number) => updateCuisine(ci, 'menus', [...(cuisines[ci].menus ?? []), { name: '', max_choices: 1, price: 0, items: [] }]);
  const removeMenu = (ci: number, mi: number) => updateCuisine(ci, 'menus', cuisines[ci].menus.filter((_: any, j: number) => j !== mi));
  const updateMenu = (ci: number, mi: number, key: string, val: any) =>
    updateCuisine(ci, 'menus', cuisines[ci].menus.map((m: any, j: number) => j === mi ? { ...m, [key]: val } : m));

  return (
    <div>
      {cuisines.map((c, ci) => (
        <div key={ci} className="card card-pad mt-12" style={{ background: 'var(--bg-2)' }}>
          <div className="flex items-center gap-8">
            <input className="input" value={c.cuisine_name} onChange={(e) => updateCuisine(ci, 'cuisine_name', e.target.value)} placeholder="e.g. Mediterranean" style={{ flex: 1 }} />
            <RemoveBtn onClick={() => removeCuisine(ci)} />
          </div>
          {(c.menus ?? []).map((m: any, mi: number) => (
            <div key={mi} style={{ marginTop: 12, paddingLeft: 16, borderLeft: '2px solid var(--line)' }}>
              <div className="flex gap-8 items-center">
                <input className="input" value={m.name} onChange={(e) => updateMenu(ci, mi, 'name', e.target.value)} placeholder="Course name (e.g. Starter)" style={{ flex: 2 }} />
                <CurrencyInput value={m.price ?? 0} onChange={(e) => updateMenu(ci, mi, 'price', +e.target.value)} placeholder="€/person" containerStyle={{ width: 100 }} />
                <input className="input" type="number" value={m.max_choices ?? 1} onChange={(e) => updateMenu(ci, mi, 'max_choices', +e.target.value)} placeholder="Max choices" style={{ width: 110 }} />
                <RemoveBtn onClick={() => removeMenu(ci, mi)} />
              </div>
              <div className="mt-8">
                <div className="field-label mb-4">Menu items (press Enter to add)</div>
                <TagInput tags={m.items ?? []} onChange={(t) => updateMenu(ci, mi, 'items', t)} placeholder="e.g. Grilled sea bass" />
              </div>
            </div>
          ))}
          <AddBtn label="Add course" onClick={() => addMenu(ci)} />
        </div>
      ))}
      <AddBtn label="Add cuisine" onClick={addCuisine} />
    </div>
  );
}

// ─── 3. Florist ───────────────────────────────────────────────────────────────
function FloristForm({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const d = data ?? {};
  const pkgs: any[] = d.packages ?? [];
  const colors: string[] = (d.colors ?? []).map((c: any) => typeof c === 'string' ? c : c.hex_color ?? '#ffffff');
  const designs: any[] = d.designs ?? [];
  const addons: any[] = d.addons ?? [];

  const setPkgs = (p: any[]) => onChange({ ...d, packages: p });
  const setColors = (c: string[]) => onChange({ ...d, colors: c });
  const setDesigns = (des: any[]) => onChange({ ...d, designs: des });
  const setAddons = (a: any[]) => onChange({ ...d, addons: a });

  return (
    <div>
      <SectionTitle title="Packages" sub="Each package is a tiered offering (e.g. Basic, Luxe, Artificial). Up to 4 photos per package." />
      {pkgs.map((p, i) => {
        const pkgImgs: string[] = Array.isArray(p.images) ? p.images : [];
        const canAddImg = pkgImgs.length < 4 && !p._uploading;
        return (
          <div key={i} className="card card-pad mt-8" style={{ background: 'var(--bg-2)' }}>
            <div className="flex gap-8 items-center">
              <select className="select" value={p.tier ?? ''} onChange={(e) => setPkgs(pkgs.map((x, j) => j === i ? { ...x, tier: e.target.value || null } : x))} style={{ width: 100 }}>
                <option value="">No tier</option>
                <option value="bronze">🥉 Bronze</option>
                <option value="silver">🥈 Silver</option>
                <option value="gold">🥇 Gold</option>
              </select>
              <input className="input" value={p.name} onChange={(e) => setPkgs(pkgs.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder="Package name" style={{ flex: 2 }} />
              <CurrencyInput value={p.price ?? 0} onChange={(e) => setPkgs(pkgs.map((x, j) => j === i ? { ...x, price: +e.target.value } : x))} placeholder="€" containerStyle={{ width: 100 }} />
              <select className="select" value={p.type ?? 'fresh'} onChange={(e) => setPkgs(pkgs.map((x, j) => j === i ? { ...x, type: e.target.value } : x))} style={{ width: 110 }}>
                <option value="fresh">Fresh</option>
                <option value="fake">Artificial</option>
              </select>
              <RemoveBtn onClick={() => setPkgs(pkgs.filter((_, j) => j !== i))} />
            </div>
            {/* Package images */}
            <div className="mt-10">
              <div className="field-label mb-6">Photos <span className="muted fw-400">({pkgImgs.length}/4)</span></div>
              <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
                {pkgImgs.map((url, ii) => (
                  <div key={ii} style={{ position: 'relative', width: 72, height: 72, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button"
                      onClick={() => setPkgs(pkgs.map((x, j) => j === i ? { ...x, images: pkgImgs.filter((_, k) => k !== ii) } : x))}
                      style={{ position: 'absolute', top: 3, right: 3, width: 18, height: 18, borderRadius: 999, background: 'rgba(0,0,0,0.55)', border: 0, color: 'white', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                      <Icon name="close" size={9} color="white" />
                    </button>
                  </div>
                ))}
                {canAddImg && (
                  <label style={{ width: 72, height: 72, borderRadius: 10, border: '2px dashed var(--line)', display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'var(--muted)', flexShrink: 0 }}>
                    <Icon name="plus" size={18} />
                    <input type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        e.target.value = '';
                        const withFlag = pkgs.map((x: any, j: number) => j === i ? { ...x, _uploading: true } : x); // eslint-disable-line @typescript-eslint/no-explicit-any
                        setPkgs(withFlag);
                        try {
                          const url = await uploadApi.serviceImage(file);
                          setPkgs(withFlag.map((x: any, j: number) => j === i ? { ...x, images: [...(Array.isArray(x.images) ? x.images : []), url], _uploading: false } : x)); // eslint-disable-line @typescript-eslint/no-explicit-any
                        } catch {
                          setPkgs(withFlag.map((x: any, j: number) => j === i ? { ...x, _uploading: false } : x)); // eslint-disable-line @typescript-eslint/no-explicit-any
                        }
                      }}
                    />
                  </label>
                )}
                {p._uploading && (
                  <div style={{ width: 72, height: 72, borderRadius: 10, border: '1px solid var(--line)', display: 'grid', placeItems: 'center', background: 'var(--bg-3)', flexShrink: 0 }}>
                    <span className="muted text-11">…</span>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-10">
              <div className="field-label mb-4">Features included (press Enter)</div>
              <TagInput tags={p.features ?? []} onChange={(f) => setPkgs(pkgs.map((x, j) => j === i ? { ...x, features: f } : x))} placeholder="e.g. Bridal bouquet" />
            </div>
          </div>
        );
      })}
      <AddBtn label="Add package" onClick={() => setPkgs([...pkgs, { name: '', price: 0, type: 'fresh', tier: null, features: [], images: [] }])} />

      <SectionTitle title="Colour palette" sub="Click a swatch to remove it." />
      <ColorInput colors={colors} onChange={setColors} />

      <SectionTitle title="Design styles" sub="Each design shows as a selectable card with a photo on the booking page." />
      {designs.map((d2, i) => (
        <div key={i} className="card card-pad mt-8" style={{ background: 'var(--bg-2)' }}>
          <div className="flex gap-8 items-center">
            {/* Image upload / preview */}
            <label style={{ position: 'relative', width: 56, height: 56, borderRadius: 10, overflow: 'hidden', border: '2px dashed var(--line)', display: 'grid', placeItems: 'center', cursor: d2._uploading ? 'wait' : 'pointer', flexShrink: 0, background: 'var(--bg-3)' }}>
              {d2.image
                ? <img src={d2.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : d2._uploading
                  ? <span className="text-10 muted">…</span>
                  : <Icon name="plus" size={16} color="var(--muted)" />
              }
              <input type="file" accept="image/*" style={{ display: 'none' }} disabled={!!d2._uploading}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  e.target.value = '';
                  setDesigns(designs.map((x, j) => j === i ? { ...x, _uploading: true } : x));
                  try {
                    const url = await uploadApi.serviceImage(file);
                    setDesigns(designs.map((x, j) => j === i ? { ...x, image: url, _uploading: false } : x));
                  } catch {
                    setDesigns(designs.map((x, j) => j === i ? { ...x, _uploading: false } : x));
                  }
                }}
              />
            </label>
            <input className="input" value={d2.name} onChange={(e) => setDesigns(designs.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder="Design name" style={{ flex: 2 }} />
            <CurrencyInput value={d2.price ?? 0} onChange={(e) => setDesigns(designs.map((x, j) => j === i ? { ...x, price: +e.target.value } : x))} placeholder="Surcharge (€)" containerStyle={{ width: 120 }} />
            <RemoveBtn onClick={() => setDesigns(designs.filter((_, j) => j !== i))} />
          </div>
        </div>
      ))}
      <AddBtn label="Add design style" onClick={() => setDesigns([...designs, { name: '', price: 0, image: '' }])} />

      <SectionTitle title="Add-ons" sub="Items customers can add per unit." />
      {addons.map((a, i) => (
        <div key={i} className="flex gap-8 mt-8 items-center">
          <input className="input" value={a.name} onChange={(e) => setAddons(addons.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder="Add-on name" style={{ flex: 2 }} />
          <CurrencyInput value={a.price_per_unit ?? 0} onChange={(e) => setAddons(addons.map((x, j) => j === i ? { ...x, price_per_unit: +e.target.value } : x))} placeholder="€/unit" containerStyle={{ width: 100 }} />
          <input className="input" value={a.unit ?? 'piece'} onChange={(e) => setAddons(addons.map((x, j) => j === i ? { ...x, unit: e.target.value } : x))} placeholder="unit (piece, pair…)" style={{ width: 120 }} />
          <RemoveBtn onClick={() => setAddons(addons.filter((_, j) => j !== i))} />
        </div>
      ))}
      <AddBtn label="Add add-on" onClick={() => setAddons([...addons, { name: '', price_per_unit: 0, unit: 'piece' }])} />
    </div>
  );
}

// ─── 4. Car Hire ──────────────────────────────────────────────────────────────
function CarHireForm({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const d = data ?? {};
  const hours: any[] = d.hours ?? [];
  const carNames: string[] = (d.addons ?? []).map((a: any) => typeof a === 'string' ? a : a.name ?? '');
  return (
    <div>
      <SectionTitle title="Hire durations & prices" />
      {hours.map((h, i) => (
        <div key={i} className="flex gap-8 mt-8 items-center">
          <input className="input" value={h.label} onChange={(e) => onChange({ ...d, hours: hours.map((x, j) => j === i ? { ...x, label: e.target.value } : x) })} placeholder="e.g. 4 Hours" style={{ flex: 2 }} />
          <CurrencyInput value={h.price ?? 0} onChange={(e) => onChange({ ...d, hours: hours.map((x, j) => j === i ? { ...x, price: +e.target.value } : x) })} placeholder="€" containerStyle={{ width: 100 }} />
          <RemoveBtn onClick={() => onChange({ ...d, hours: hours.filter((_, j) => j !== i) })} />
        </div>
      ))}
      <AddBtn label="Add duration" onClick={() => onChange({ ...d, hours: [...hours, { label: '', price: 0 }] })} />

      <SectionTitle title="Add-ons" sub="One per line — press Enter to add." />
      <TagInput tags={carNames} onChange={(t) => onChange({ ...d, addons: t.map((n) => ({ name: n })) })} placeholder="e.g. Champagne service" />
    </div>
  );
}

// ─── 5. Photography ───────────────────────────────────────────────────────────
function PhotographyForm({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const pkgs: any[] = data?.packages ?? [];
  const setPkgs = (p: any[]) => onChange({ ...data, packages: p });

  return (
    <div>
      <SectionTitle title="Packages" />
      {pkgs.map((p, i) => (
        <div key={i} className="card card-pad mt-8" style={{ background: 'var(--bg-2)' }}>
          <div className="flex gap-8 items-center">
            <input className="input" value={p.package_name ?? p.name ?? ''} onChange={(e) => setPkgs(pkgs.map((x, j) => j === i ? { ...x, package_name: e.target.value } : x))} placeholder="Package name (e.g. Gold)" style={{ flex: 2 }} />
            <CurrencyInput value={p.price ?? 0} onChange={(e) => setPkgs(pkgs.map((x, j) => j === i ? { ...x, price: +e.target.value } : x))} placeholder="€" containerStyle={{ width: 110 }} />
            <RemoveBtn onClick={() => setPkgs(pkgs.filter((_, j) => j !== i))} />
          </div>
          <div className="mt-8">
            <div className="field-label mb-4">What's included (press Enter)</div>
            <TagInput tags={p.includes ?? []} onChange={(t) => setPkgs(pkgs.map((x, j) => j === i ? { ...x, includes: t } : x))} placeholder="e.g. 500 edited images" />
          </div>
          <div className="mt-8">
            <div className="field-label mb-4">Add-ons for this package</div>
            {(p.addons ?? []).map((a: any, ai: number) => (
              <div key={ai} className="flex gap-8 mt-4 items-center">
                <input className="input" value={a.name} onChange={(e) => setPkgs(pkgs.map((x, j) => j === i ? { ...x, addons: x.addons.map((aa: any, k: number) => k === ai ? { ...aa, name: e.target.value } : aa) } : x))} placeholder="Add-on name" style={{ flex: 2 }} />
                <CurrencyInput value={a.price ?? 0} onChange={(e) => setPkgs(pkgs.map((x, j) => j === i ? { ...x, addons: x.addons.map((aa: any, k: number) => k === ai ? { ...aa, price: +e.target.value } : aa) } : x))} placeholder="€" containerStyle={{ width: 90 }} />
                <RemoveBtn onClick={() => setPkgs(pkgs.map((x, j) => j === i ? { ...x, addons: x.addons.filter((_: any, k: number) => k !== ai) } : x))} />
              </div>
            ))}
            <AddBtn label="Add add-on" onClick={() => setPkgs(pkgs.map((x, j) => j === i ? { ...x, addons: [...(x.addons ?? []), { name: '', price: 0 }] } : x))} />
          </div>
        </div>
      ))}
      <AddBtn label="Add package" onClick={() => setPkgs([...pkgs, { package_name: '', price: 0, includes: [], addons: [] }])} />
    </div>
  );
}

// ─── 6. Music ─────────────────────────────────────────────────────────────────
function MusicForm({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const d = data ?? {};
  return (
    <div>
      <Row cols={2}>
        <Field label="Price per hour (€)">
          <CurrencyInput value={d.price_per_hour ?? ''} onChange={(e) => onChange({ ...d, price_per_hour: +e.target.value })} placeholder="e.g. 180" />
        </Field>
        <Field label="Demo / Showreel URL">
          <input className="input" value={d.video_url ?? ''} onChange={(e) => onChange({ ...d, video_url: e.target.value })} placeholder="https://youtube.com/embed/…" />
        </Field>
      </Row>
    </div>
  );
}

// ─── 7. Bride Dress ───────────────────────────────────────────────────────────
function BrideDressForm({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const d = data ?? {};
  const sizes: string[] = d.available_sizes ?? [];
  const extras: any[] = d.extras ?? [];
  return (
    <div>
      <Row cols={2}>
        <Field label="Rent price (€)"><CurrencyInput value={d.price_rent ?? ''} onChange={(e) => onChange({ ...d, price_rent: +e.target.value })} /></Field>
        <Field label="Buy price (€)"><CurrencyInput value={d.price_buy ?? ''} onChange={(e) => onChange({ ...d, price_buy: +e.target.value })} /></Field>
      </Row>
      <div className="mt-12">
        <Field label="Available sizes (press Enter to add)">
          <TagInput tags={sizes} onChange={(t) => onChange({ ...d, available_sizes: t })} placeholder="e.g. XS, S, M, L…" />
        </Field>
      </div>
      <SectionTitle title="Add-ons" sub="Each add-on can show a photo on the booking page." />
      {extras.map((e2, i) => (
        <div key={i} className="flex gap-8 mt-8 items-center">
          {/* Image upload / preview */}
          <label style={{ position: 'relative', width: 56, height: 56, borderRadius: 10, overflow: 'hidden', border: '2px dashed var(--line)', display: 'grid', placeItems: 'center', cursor: e2._uploading ? 'wait' : 'pointer', flexShrink: 0, background: 'var(--bg-3)' }}>
            {e2.image
              ? <img src={e2.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : e2._uploading
                ? <span className="text-10 muted">…</span>
                : <Icon name="plus" size={16} color="var(--muted)" />
            }
            <input type="file" accept="image/*" style={{ display: 'none' }} disabled={!!e2._uploading}
              onChange={async (ev) => {
                const file = ev.target.files?.[0];
                if (!file) return;
                ev.target.value = '';
                onChange({ ...d, extras: extras.map((x, j) => j === i ? { ...x, _uploading: true } : x) });
                try {
                  const url = await uploadApi.serviceImage(file);
                  onChange({ ...d, extras: extras.map((x, j) => j === i ? { ...x, image: url, _uploading: false } : x) });
                } catch {
                  onChange({ ...d, extras: extras.map((x, j) => j === i ? { ...x, _uploading: false } : x) });
                }
              }}
            />
          </label>
          <input className="input" value={e2.name ?? ''} onChange={(ev) => onChange({ ...d, extras: extras.map((x, j) => j === i ? { ...x, name: ev.target.value } : x) })} placeholder="Extra name (e.g. Veil)" style={{ flex: 2 }} />
          <CurrencyInput value={e2.price ?? 0} onChange={(ev) => onChange({ ...d, extras: extras.map((x, j) => j === i ? { ...x, price: +ev.target.value } : x) })} placeholder="€" containerStyle={{ width: 100 }} />
          <RemoveBtn onClick={() => onChange({ ...d, extras: extras.filter((_, j) => j !== i) })} />
        </div>
      ))}
      <AddBtn label="Add extra" onClick={() => onChange({ ...d, extras: [...extras, { name: '', price: 0, image: '' }] })} />
    </div>
  );
}

// ─── 8 & 10. Groom Suite / Best Man (identical shape) ────────────────────────
function SuitForm({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const d = data ?? {};
  return (
    <div>
      <Row cols={2}>
        <Field label="Rent price (€)"><CurrencyInput value={d.price_rent ?? ''} onChange={(e) => onChange({ ...d, price_rent: +e.target.value })} /></Field>
        <Field label="Buy price (€)"><CurrencyInput value={d.price_buy ?? ''} onChange={(e) => onChange({ ...d, price_buy: +e.target.value })} /></Field>
      </Row>
      {(['jacket_sizes', 'vest_sizes', 'shirt_sizes', 'bottom_sizes'] as const).map((key) => {
        const labels: Record<string, string> = { jacket_sizes: 'Jacket sizes', vest_sizes: 'Vest sizes', shirt_sizes: 'Shirt sizes', bottom_sizes: 'Trouser sizes' };
        return (
          <div key={key} className="mt-12">
            <Field label={labels[key]}>
              <TagInput tags={d[key] ?? []} onChange={(t) => onChange({ ...d, [key]: t })} placeholder="Add size + Enter" />
            </Field>
          </div>
        );
      })}
    </div>
  );
}

// ─── 9. Bridesmaid ────────────────────────────────────────────────────────────
function BridesmaidForm({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const d = data ?? {};
  return (
    <div>
      <Row cols={2}>
        <Field label="Price per dress (€)"><CurrencyInput value={d.price ?? ''} onChange={(e) => onChange({ ...d, price: +e.target.value })} /></Field>
      </Row>
      <div className="mt-12">
        <Field label="Available sizes (press Enter)">
          <TagInput tags={d.available_sizes ?? []} onChange={(t) => onChange({ ...d, available_sizes: t })} placeholder="e.g. XS, S, M…" />
        </Field>
      </div>
    </div>
  );
}

// ─── 11. Flower Girl ─────────────────────────────────────────────────────────
const FLOWER_GIRL_SIZES = ['1Y', '2-3Y', '4-5Y', '6-7Y', '8-9Y', '10Y', '12Y'];

function FlowerGirlForm({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const d = data ?? {};
  const selected: string[] = d.age_groups ?? [];
  const remaining = FLOWER_GIRL_SIZES.filter((s) => !selected.includes(s));
  const [pick, setPick] = useState('');

  const addSize = () => {
    if (pick && !selected.includes(pick)) {
      onChange({ ...d, age_groups: [...selected, pick] });
      setPick('');
    }
  };
  const removeSize = (s: string) => onChange({ ...d, age_groups: selected.filter((x) => x !== s) });

  return (
    <div>
      <div>
        <div className="field-label mb-8">Add product price</div>
        <CurrencyInput value={d.price ?? ''} onChange={(e) => onChange({ ...d, price: +e.target.value })} placeholder="80" />
      </div>

      <div className="mt-20">
        <div className="field-label mb-10">Select dress sizes</div>

        {/* Selected size chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: selected.length ? 14 : 0 }}>
          {selected.map((s) => (
            <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', border: '1px solid var(--line)', borderRadius: 999, fontSize: 14, fontWeight: 500, background: 'white', position: 'relative' }}>
              {/* Red delete dot */}
              <span style={{ position: 'absolute', top: -4, left: -4, width: 14, height: 14, borderRadius: 999, background: '#E11D48', display: 'grid', placeItems: 'center', cursor: 'pointer' }}
                onClick={() => removeSize(s)}>
                <Icon name="close" size={7} color="white" />
              </span>
              {s}
            </span>
          ))}
        </div>

        {/* Dropdown + Add */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select
            className="select"
            value={pick}
            onChange={(e) => setPick(e.target.value)}
            style={{ minWidth: 180 }}
          >
            <option value="">Choose size</option>
            {remaining.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={addSize}
            disabled={!pick}
            style={{ minWidth: 60 }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 12. Yacht ────────────────────────────────────────────────────────────────
function YachtForm({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const d = data ?? {};
  const hours: any[] = d.hours ?? [];
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...d, [k]: e.target.value });
  return (
    <div>
      <Row cols={3}>
        <Field label="Min guests"><input className="input" type="number" value={d.min_people ?? ''} onChange={set('min_people')} /></Field>
        <Field label="Max guests"><input className="input" type="number" value={d.max_people ?? ''} onChange={set('max_people')} /></Field>
        <Field label="Cabin crew"><input className="input" type="number" value={d.cabin_crew ?? ''} onChange={set('cabin_crew')} /></Field>
      </Row>
      <Row cols={3}>
        <Field label="Length"><input className="input" value={d.length ?? ''} onChange={set('length')} placeholder="e.g. 58 ft" /></Field>
        <Field label="Speed"><input className="input" value={d.speed ?? ''} onChange={set('speed')} placeholder="e.g. 16 knots" /></Field>
        <Field label="Washrooms"><input className="input" type="number" value={d.washroom ?? ''} onChange={set('washroom')} /></Field>
      </Row>
      <div className="flex gap-16 items-center mt-12">
        <label className="flex items-center gap-8" style={{ cursor: 'pointer' }}>
          <input type="checkbox" checked={!!d.chef_included} onChange={(e) => onChange({ ...d, chef_included: e.target.checked })} style={{ accentColor: 'var(--primary)' }} />
          <span className="text-14">Chef included</span>
        </label>
      </div>
      <SectionTitle title="Charter durations & prices" />
      {hours.map((h, i) => (
        <div key={i} className="flex gap-8 mt-8 items-center">
          <input className="input" value={h.label} onChange={(e) => onChange({ ...d, hours: hours.map((x, j) => j === i ? { ...x, label: e.target.value } : x) })} placeholder="e.g. 4 Hours" style={{ flex: 2 }} />
          <CurrencyInput value={h.price ?? 0} onChange={(e) => onChange({ ...d, hours: hours.map((x, j) => j === i ? { ...x, price: +e.target.value } : x) })} placeholder="€" containerStyle={{ width: 100 }} />
          <RemoveBtn onClick={() => onChange({ ...d, hours: hours.filter((_, j) => j !== i) })} />
        </div>
      ))}
      <AddBtn label="Add duration" onClick={() => onChange({ ...d, hours: [...hours, { label: '', price: 0 }] })} />
    </div>
  );
}

// ─── 13. Bachelor ─────────────────────────────────────────────────────────────
function BachelorForm({ data, onChange, showSpa = false }: { data: any; onChange: (d: any) => void; showSpa?: boolean }) {
  const d = data ?? {};
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...d, [k]: +e.target.value });
  return (
    <div>
      <Row cols={2}>
        <Field label="Base price per hour (€)"><CurrencyInput value={d.price_per_hour ?? ''} onChange={set('price_per_hour')} /></Field>
        <Field label="Price per person (€)"><CurrencyInput value={d.price_per_person ?? ''} onChange={set('price_per_person')} /></Field>
      </Row>
      <SectionTitle title="Activity prices" sub="Set to 0 to hide the activity." />
      <Row cols={2}>
        <Field label="Catamaran trip (€)"><CurrencyInput value={d.catamaran_price ?? ''} onChange={set('catamaran_price')} /></Field>
        <Field label="Excursion (€)"><CurrencyInput value={d.excursion_price ?? ''} onChange={set('excursion_price')} /></Field>
      </Row>
      <Row cols={2}>
        <Field label="Bar crawl (€)"><CurrencyInput value={d.bar_crawl_price ?? ''} onChange={set('bar_crawl_price')} /></Field>
        <Field label="Night out (€)"><CurrencyInput value={d.night_out_price ?? ''} onChange={set('night_out_price')} /></Field>
      </Row>
      {showSpa && (
        <Row cols={2}>
          <Field label="Spa day (€)"><CurrencyInput value={d.spa_day_price ?? ''} onChange={set('spa_day_price')} /></Field>
        </Row>
      )}
    </div>
  );
}

// ─── 15. Hotel ────────────────────────────────────────────────────────────────
function HotelForm({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const d = data ?? {};
  const rooms: any[] = d.rooms ?? [];
  const facilities: any[] = d.facilities ?? [];
  return (
    <div>
      <SectionTitle title="Room types" />
      {rooms.map((r, i) => (
        <div key={i} className="card card-pad mt-8" style={{ background: 'var(--bg-2)' }}>
          <div className="flex gap-8 items-center">
            <input className="input" value={r.room_type ?? ''} onChange={(e) => onChange({ ...d, rooms: rooms.map((x, j) => j === i ? { ...x, room_type: e.target.value } : x) })} placeholder="Room type (e.g. Deluxe Sea View)" style={{ flex: 2 }} />
            <RemoveBtn onClick={() => onChange({ ...d, rooms: rooms.filter((_, j) => j !== i) })} />
          </div>
          <Row cols={3}>
            <Field label="Per night (€)"><CurrencyInput value={r.price_per_night ?? ''} onChange={(e) => onChange({ ...d, rooms: rooms.map((x, j) => j === i ? { ...x, price_per_night: +e.target.value } : x) })} /></Field>
            <Field label="Max adults"><input className="input" type="number" value={r.max_adults ?? ''} onChange={(e) => onChange({ ...d, rooms: rooms.map((x, j) => j === i ? { ...x, max_adults: +e.target.value } : x) })} /></Field>
            <Field label="Max kids"><input className="input" type="number" value={r.max_kids ?? ''} onChange={(e) => onChange({ ...d, rooms: rooms.map((x, j) => j === i ? { ...x, max_kids: +e.target.value } : x) })} /></Field>
          </Row>
        </div>
      ))}
      <AddBtn label="Add room type" onClick={() => onChange({ ...d, rooms: [...rooms, { room_type: '', price_per_night: 0, max_adults: 2, max_kids: 0 }] })} />

      <SectionTitle title="Facilities / extras" />
      {facilities.map((f, i) => (
        <div key={i} className="flex gap-8 mt-8 items-center">
          <input className="input" value={f.name ?? ''} onChange={(e) => onChange({ ...d, facilities: facilities.map((x, j) => j === i ? { ...x, name: e.target.value } : x) })} placeholder="Facility name" style={{ flex: 2 }} />
          <CurrencyInput value={f.price ?? 0} onChange={(e) => onChange({ ...d, facilities: facilities.map((x, j) => j === i ? { ...x, price: +e.target.value } : x) })} placeholder="€ (0 = free)" containerStyle={{ width: 130 }} />
          <RemoveBtn onClick={() => onChange({ ...d, facilities: facilities.filter((_, j) => j !== i) })} />
        </div>
      ))}
      <AddBtn label="Add facility" onClick={() => onChange({ ...d, facilities: [...facilities, { name: '', price: 0 }] })} />
    </div>
  );
}

// ─── 16. Bar ──────────────────────────────────────────────────────────────────
function BarForm({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const menus: any[] = data?.menus ?? [];
  const setMenus = (m: any[]) => onChange({ ...data, menus: m });
  return (
    <div>
      <SectionTitle title="Bar packages / menus" sub="Each menu is a package customers can select." />
      {menus.map((m, i) => (
        <div key={i} className="card card-pad mt-8" style={{ background: 'var(--bg-2)' }}>
          <div className="flex gap-8 items-center">
            <input className="input" value={m.name ?? ''} onChange={(e) => setMenus(menus.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder="Menu name (e.g. Classic Cocktails)" style={{ flex: 2 }} />
            <CurrencyInput value={m.price ?? 0} onChange={(e) => setMenus(menus.map((x, j) => j === i ? { ...x, price: +e.target.value } : x))} placeholder="€" containerStyle={{ width: 100 }} />
            <RemoveBtn onClick={() => setMenus(menus.filter((_, j) => j !== i))} />
          </div>
          <div className="mt-8">
            <div className="field-label mb-4">Drinks / items in this menu</div>
            <TagInput tags={m.items ?? []} onChange={(t) => setMenus(menus.map((x, j) => j === i ? { ...x, items: t } : x))} placeholder="e.g. Mojito" />
          </div>
        </div>
      ))}
      <AddBtn label="Add menu" onClick={() => setMenus([...menus, { name: '', price: 0, items: [] }])} />
    </div>
  );
}

// ─── 17. Makeup ───────────────────────────────────────────────────────────────
function MakeupForm({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const d = data ?? {};
  const mode: 'packages' | 'regular' = d.pricing_mode ?? 'regular';
  const setMode = (m: 'packages' | 'regular') => onChange({ ...d, pricing_mode: m });
  const pkgs: any[] = d.packages ?? [];
  const setPkgs = (p: any[]) => onChange({ ...d, packages: p });

  return (
    <div>
      {/* ── Pricing mode toggle ── */}
      <div className="flex items-center gap-12 mt-4" style={{ flexWrap: 'wrap' }}>
        <span className="fw-600 text-14">Pricing mode</span>
        <div style={{ display: 'flex', border: '1px solid var(--line)', borderRadius: 10, overflow: 'hidden' }}>
          {(['regular', 'packages'] as const).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)}
              style={{
                padding: '7px 20px', fontSize: 13, fontWeight: mode === m ? 700 : 400,
                background: mode === m ? 'var(--primary)' : 'transparent',
                color: mode === m ? 'white' : 'var(--ink)',
                border: 0, cursor: 'pointer', textTransform: 'capitalize', transition: 'background .15s',
              }}>
              {m === 'regular' ? 'Regular' : 'Packages'}
            </button>
          ))}
        </div>
        <span className="muted text-12">
          {mode === 'packages'
            ? 'Customers see tiered packages on your service page.'
            : 'Customers see individual prices for each service.'}
        </span>
      </div>

      {/* ── Regular mode ── */}
      {mode === 'regular' && (
        <>
          <Row cols={3}>
            <Field label="Bridal makeup (€)"><CurrencyInput value={d.price_bridal ?? ''} onChange={(e) => onChange({ ...d, price_bridal: +e.target.value })} /></Field>
            <Field label="After-wedding look (€)"><CurrencyInput value={d.price_after_wedding ?? ''} onChange={(e) => onChange({ ...d, price_after_wedding: +e.target.value })} /></Field>
            <Field label="Party makeup (€)"><CurrencyInput value={d.price_party ?? ''} onChange={(e) => onChange({ ...d, price_party: +e.target.value })} /></Field>
          </Row>
          <SectionTitle title="Trial sessions" />
          <Row cols={2}>
            <Field label="Trial 1 price (€)"><CurrencyInput value={d.price_trial_1 ?? ''} onChange={(e) => onChange({ ...d, price_trial_1: +e.target.value })} /></Field>
            <Field label="Trial 2 price (€)"><CurrencyInput value={d.price_trial_2 ?? ''} onChange={(e) => onChange({ ...d, price_trial_2: +e.target.value })} /></Field>
          </Row>
        </>
      )}

      {/* ── Packages mode ── */}
      {mode === 'packages' && (
        <>
          <SectionTitle title="Packages" sub="Each package is a tiered offering (e.g. Basic, Luxe, Airbrush). Up to 4 photos per package." />
          {pkgs.map((p, i) => {
            const pkgImgs: string[] = Array.isArray(p.images) ? p.images : [];
            const canAddImg = pkgImgs.length < 4 && !p._uploading;
            return (
              <div key={i} className="card card-pad mt-8" style={{ background: 'var(--bg-2)' }}>
                <div className="flex gap-8 items-center">
                  <select className="select" value={p.tier ?? ''} onChange={(e) => setPkgs(pkgs.map((x, j) => j === i ? { ...x, tier: e.target.value || null } : x))} style={{ width: 100 }}>
                    <option value="">No tier</option>
                    <option value="bronze">🥉 Bronze</option>
                    <option value="silver">🥈 Silver</option>
                    <option value="gold">🥇 Gold</option>
                  </select>
                  <input className="input" value={p.name ?? ''} onChange={(e) => setPkgs(pkgs.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder="Package name" style={{ flex: 2 }} />
                  <CurrencyInput value={p.price ?? 0} onChange={(e) => setPkgs(pkgs.map((x, j) => j === i ? { ...x, price: +e.target.value } : x))} placeholder="€" containerStyle={{ width: 100 }} />
                  <RemoveBtn onClick={() => setPkgs(pkgs.filter((_, j) => j !== i))} />
                </div>
                {/* Package images */}
                <div className="mt-10">
                  <div className="field-label mb-6">Photos <span className="muted fw-400">({pkgImgs.length}/4)</span></div>
                  <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
                    {pkgImgs.map((url, ii) => (
                      <div key={ii} style={{ position: 'relative', width: 72, height: 72, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button type="button"
                          onClick={() => setPkgs(pkgs.map((x, j) => j === i ? { ...x, images: pkgImgs.filter((_, k) => k !== ii) } : x))}
                          style={{ position: 'absolute', top: 3, right: 3, width: 18, height: 18, borderRadius: 999, background: 'rgba(0,0,0,0.55)', border: 0, color: 'white', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                          <Icon name="close" size={9} color="white" />
                        </button>
                      </div>
                    ))}
                    {canAddImg && (
                      <label style={{ width: 72, height: 72, borderRadius: 10, border: '2px dashed var(--line)', display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'var(--muted)', flexShrink: 0 }}>
                        <Icon name="plus" size={18} />
                        <input type="file" accept="image/*" style={{ display: 'none' }}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            e.target.value = '';
                            const withFlag = pkgs.map((x: any, j: number) => j === i ? { ...x, _uploading: true } : x); // eslint-disable-line @typescript-eslint/no-explicit-any
                            setPkgs(withFlag);
                            try {
                              const url = await uploadApi.serviceImage(file);
                              setPkgs(withFlag.map((x: any, j: number) => j === i ? { ...x, images: [...(Array.isArray(x.images) ? x.images : []), url], _uploading: false } : x)); // eslint-disable-line @typescript-eslint/no-explicit-any
                            } catch {
                              setPkgs(withFlag.map((x: any, j: number) => j === i ? { ...x, _uploading: false } : x)); // eslint-disable-line @typescript-eslint/no-explicit-any
                            }
                          }}
                        />
                      </label>
                    )}
                    {p._uploading && (
                      <div style={{ width: 72, height: 72, borderRadius: 10, border: '1px solid var(--line)', display: 'grid', placeItems: 'center', background: 'var(--bg-3)', flexShrink: 0 }}>
                        <span className="muted text-11">…</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-10">
                  <div className="field-label mb-4">Features included (press Enter)</div>
                  <TagInput tags={p.features ?? []} onChange={(f) => setPkgs(pkgs.map((x, j) => j === i ? { ...x, features: f } : x))} placeholder="e.g. Airbrush finish, Lash application" />
                </div>
              </div>
            );
          })}
          <AddBtn label="Add package" onClick={() => setPkgs([...pkgs, { name: '', price: 0, tier: null, features: [], images: [] }])} />
        </>
      )}
    </div>
  );
}

// ─── 18. Hair (identical structure to Makeup) ─────────────────────────────────
function HairVendorForm({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const d = data ?? {};
  const mode: 'packages' | 'regular' = d.pricing_mode ?? 'regular';
  const setMode = (m: 'packages' | 'regular') => onChange({ ...d, pricing_mode: m });
  const pkgs: any[] = d.packages ?? [];
  const setPkgs = (p: any[]) => onChange({ ...d, packages: p });

  return (
    <div>
      <div className="flex items-center gap-12 mt-4" style={{ flexWrap: 'wrap' }}>
        <span className="fw-600 text-14">Pricing mode</span>
        <div style={{ display: 'flex', border: '1px solid var(--line)', borderRadius: 10, overflow: 'hidden' }}>
          {(['regular', 'packages'] as const).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)}
              style={{
                padding: '7px 20px', fontSize: 13, fontWeight: mode === m ? 700 : 400,
                background: mode === m ? 'var(--primary)' : 'transparent',
                color: mode === m ? 'white' : 'var(--ink)',
                border: 0, cursor: 'pointer', textTransform: 'capitalize', transition: 'background .15s',
              }}>
              {m === 'regular' ? 'Regular' : 'Packages'}
            </button>
          ))}
        </div>
        <span className="muted text-12">
          {mode === 'packages'
            ? 'Customers see tiered packages on your service page.'
            : 'Customers see individual prices for each service.'}
        </span>
      </div>

      {mode === 'regular' && (
        <>
          <Row cols={3}>
            <Field label="Bridal hair (€)"><CurrencyInput value={d.price_bridal ?? ''} onChange={(e) => onChange({ ...d, price_bridal: +e.target.value })} /></Field>
            <Field label="After-wedding hair (€)"><CurrencyInput value={d.price_after_wedding ?? ''} onChange={(e) => onChange({ ...d, price_after_wedding: +e.target.value })} /></Field>
            <Field label="Party hair (€)"><CurrencyInput value={d.price_party ?? ''} onChange={(e) => onChange({ ...d, price_party: +e.target.value })} /></Field>
          </Row>
          <SectionTitle title="Trial sessions" />
          <Row cols={2}>
            <Field label="Trial 1 price (€)"><CurrencyInput value={d.price_trial_1 ?? ''} onChange={(e) => onChange({ ...d, price_trial_1: +e.target.value })} /></Field>
            <Field label="Trial 2 price (€)"><CurrencyInput value={d.price_trial_2 ?? ''} onChange={(e) => onChange({ ...d, price_trial_2: +e.target.value })} /></Field>
          </Row>
        </>
      )}

      {mode === 'packages' && (
        <>
          <SectionTitle title="Packages" sub="Each package is a tiered offering (e.g. Basic, Luxe, Airbrush). Up to 4 photos per package." />
          {pkgs.map((p, i) => {
            const pkgImgs: string[] = Array.isArray(p.images) ? p.images : [];
            const canAddImg = pkgImgs.length < 4 && !p._uploading;
            return (
              <div key={i} className="card card-pad mt-8" style={{ background: 'var(--bg-2)' }}>
                <div className="flex gap-8 items-center">
                  <select className="select" value={p.tier ?? ''} onChange={(e) => setPkgs(pkgs.map((x, j) => j === i ? { ...x, tier: e.target.value || null } : x))} style={{ width: 100 }}>
                    <option value="">No tier</option>
                    <option value="bronze">🥉 Bronze</option>
                    <option value="silver">🥈 Silver</option>
                    <option value="gold">🥇 Gold</option>
                  </select>
                  <input className="input" value={p.name ?? ''} onChange={(e) => setPkgs(pkgs.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder="Package name" style={{ flex: 2 }} />
                  <CurrencyInput value={p.price ?? 0} onChange={(e) => setPkgs(pkgs.map((x, j) => j === i ? { ...x, price: +e.target.value } : x))} placeholder="€" containerStyle={{ width: 100 }} />
                  <RemoveBtn onClick={() => setPkgs(pkgs.filter((_, j) => j !== i))} />
                </div>
                <div className="mt-10">
                  <div className="field-label mb-6">Photos <span className="muted fw-400">({pkgImgs.length}/4)</span></div>
                  <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
                    {pkgImgs.map((url, ii) => (
                      <div key={ii} style={{ position: 'relative', width: 72, height: 72, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button type="button"
                          onClick={() => setPkgs(pkgs.map((x, j) => j === i ? { ...x, images: pkgImgs.filter((_, k) => k !== ii) } : x))}
                          style={{ position: 'absolute', top: 3, right: 3, width: 18, height: 18, borderRadius: 999, background: 'rgba(0,0,0,0.55)', border: 0, color: 'white', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                          <Icon name="close" size={9} color="white" />
                        </button>
                      </div>
                    ))}
                    {canAddImg && (
                      <label style={{ width: 72, height: 72, borderRadius: 10, border: '2px dashed var(--line)', display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'var(--muted)', flexShrink: 0 }}>
                        <Icon name="plus" size={18} />
                        <input type="file" accept="image/*" style={{ display: 'none' }}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            e.target.value = '';
                            const withFlag = pkgs.map((x: any, j: number) => j === i ? { ...x, _uploading: true } : x); // eslint-disable-line @typescript-eslint/no-explicit-any
                            setPkgs(withFlag);
                            try {
                              const url = await uploadApi.serviceImage(file);
                              setPkgs(withFlag.map((x: any, j: number) => j === i ? { ...x, images: [...(Array.isArray(x.images) ? x.images : []), url], _uploading: false } : x)); // eslint-disable-line @typescript-eslint/no-explicit-any
                            } catch {
                              setPkgs(withFlag.map((x: any, j: number) => j === i ? { ...x, _uploading: false } : x)); // eslint-disable-line @typescript-eslint/no-explicit-any
                            }
                          }}
                        />
                      </label>
                    )}
                    {p._uploading && (
                      <div style={{ width: 72, height: 72, borderRadius: 10, border: '1px solid var(--line)', display: 'grid', placeItems: 'center', background: 'var(--bg-3)', flexShrink: 0 }}>
                        <span className="muted text-11">…</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-10">
                  <div className="field-label mb-4">Features included (press Enter)</div>
                  <TagInput tags={p.features ?? []} onChange={(f) => setPkgs(pkgs.map((x, j) => j === i ? { ...x, features: f } : x))} placeholder="e.g. Blowdry, Updo, Extensions" />
                </div>
              </div>
            );
          })}
          <AddBtn label="Add package" onClick={() => setPkgs([...pkgs, { name: '', price: 0, tier: null, features: [], images: [] }])} />
        </>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export interface ServiceSubdataEditorProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  service: any; // full API service object including sub-table relations
  onSave: (data: object) => void;
  isSaving: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractSubdata(service: any): any {
  const slug = service?.category?.slug ?? '';
  switch (slug) {
    case 'venue':        return service.venue ?? null;
    case 'catering': {
      const cat = service.catering ?? null;
      if (!cat) return null;
      return {
        ...cat,
        cuisines: (cat.cuisines ?? []).map((c: any) => ({
          ...c,
          menus: (c.menus ?? []).map((m: any) => ({
            ...m,
            items: (m.items ?? []).map((it: any) => typeof it === 'string' ? it : (it.name ?? '')),
          })),
        })),
      };
    }
    case 'florist':      return service.florist ?? null;
    case 'car-hire':     return service.car_hire ?? service.carHire ?? null;
    case 'photography':  return service.photography ?? null;
    case 'music':        return service.music ?? null;
    case 'bride-dress':  return service.bride_dress ?? service.brideDress ?? null;
    case 'groom-suite':  return service.groom_suite ?? service.groomSuite ?? null;
    case 'best-man':     return service.best_man_suit ?? service.bestManSuit ?? null;
    case 'bridesmaid':   return service.bridesmaid_dress ?? service.bridesmaidDress ?? null;
    case 'flower-girl':  return service.flower_girl_dress ?? service.flowerGirlDress ?? null;  // DB: flower-girl
    case 'yacht':        return service.yacht_hire ?? service.yachtHire ?? null;               // DB: yacht
    case 'bachelor':     return service.bachelor ?? null;
    case 'bachelorette': return service.bachelorette ?? null;
    case 'hotel':        return service.accommodation ?? null;
    case 'bar': {
      const bar = service.bar ?? null;
      if (!bar) return null;
      // Backend returns menu items as objects ({id, name, …}); TagInput needs strings.
      return {
        ...bar,
        menus: (bar.menus ?? []).map((m: any) => ({
          ...m,
          items: (m.items ?? []).map((it: any) => typeof it === 'string' ? it : (it.name ?? '')),
        })),
      };
    }
    case 'makeup':       return service.makeup ?? null;                                         // DB: makeup
    case 'hair':         return service.hair ?? null;
    case 'invitation':   return service.invitation ?? null;
    default:             return null;
  }
}

// ─── 19. Invitation ───────────────────────────────────────────────────────────
function InvitationForm({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const d = data ?? {};
  const types: any[] = d.types ?? [];
  const designs: any[] = d.designs ?? [];
  const addons: any[] = d.addons ?? [];

  const setTypes = (t: any[]) => onChange({ ...d, types: t });
  const setDesigns = (des: any[]) => onChange({ ...d, designs: des });
  const setAddons = (a: any[]) => onChange({ ...d, addons: a });

  return (
    <div>
      <SectionTitle title="Invitation types" sub="Offer Digital and/or Printed — set a per-invitation price for each. Customers can pick one or more. (The customer picks their event date separately.)" />
      {types.map((t, i) => (
        <div key={i} className="flex gap-8 mt-8 items-center">
          <input className="input" value={t.name} onChange={(e) => setTypes(types.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder="e.g. Digital Invitation" style={{ flex: 2 }} />
          <CurrencyInput value={t.price ?? 0} onChange={(e) => setTypes(types.map((x, j) => j === i ? { ...x, price: +e.target.value } : x))} placeholder="€ / invite" containerStyle={{ width: 120 }} />
          <RemoveBtn onClick={() => setTypes(types.filter((_, j) => j !== i))} />
        </div>
      ))}
      <div className="flex gap-8">
        <AddBtn label="Add type" onClick={() => setTypes([...types, { name: '', price: 0 }])} />
        {types.length === 0 && (
          <AddBtn label="Add Digital / Printed" onClick={() => setTypes([
            { name: 'Digital Invitation', price: 0 },
            { name: 'Printed Invitation', price: 0 },
          ])} />
        )}
      </div>

      <SectionTitle title="Designs" sub="Each design is a selectable card with a photo and its own per-invitation price." />
      {designs.map((des, i) => (
        <div key={i} className="card card-pad mt-8" style={{ background: 'var(--bg-2)' }}>
          <div className="flex gap-8 items-center">
            <label style={{ position: 'relative', width: 56, height: 56, borderRadius: 10, overflow: 'hidden', border: '2px dashed var(--line)', display: 'grid', placeItems: 'center', cursor: des._uploading ? 'wait' : 'pointer', flexShrink: 0, background: 'var(--bg-3)' }}>
              {des.image
                ? <img src={des.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : des._uploading
                  ? <span className="text-10 muted">…</span>
                  : <Icon name="plus" size={16} color="var(--muted)" />
              }
              <input type="file" accept="image/*" style={{ display: 'none' }} disabled={!!des._uploading}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  e.target.value = '';
                  setDesigns(designs.map((x, j) => j === i ? { ...x, _uploading: true } : x));
                  try {
                    const url = await uploadApi.serviceImage(file);
                    setDesigns(designs.map((x, j) => j === i ? { ...x, image: url, _uploading: false } : x));
                  } catch {
                    setDesigns(designs.map((x, j) => j === i ? { ...x, _uploading: false } : x));
                  }
                }}
              />
            </label>
            <input className="input" value={des.name} onChange={(e) => setDesigns(designs.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder="Design name" style={{ flex: 2 }} />
            <CurrencyInput value={des.price ?? 0} onChange={(e) => setDesigns(designs.map((x, j) => j === i ? { ...x, price: +e.target.value } : x))} placeholder="€ / invite" containerStyle={{ width: 120 }} />
            <RemoveBtn onClick={() => setDesigns(designs.filter((_, j) => j !== i))} />
          </div>
        </div>
      ))}
      <AddBtn label="Add design" onClick={() => setDesigns([...designs, { name: '', price: 0, image: '' }])} />

      <SectionTitle title="Add-ons" sub="Optional extras like envelopes or a wax seal — priced per invitation." />
      {addons.map((a, i) => (
        <div key={i} className="flex gap-8 mt-8 items-center">
          <input className="input" value={a.name} onChange={(e) => setAddons(addons.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder="e.g. Envelope" style={{ flex: 2 }} />
          <CurrencyInput value={a.price ?? 0} onChange={(e) => setAddons(addons.map((x, j) => j === i ? { ...x, price: +e.target.value } : x))} placeholder="€ / invite" containerStyle={{ width: 120 }} />
          <RemoveBtn onClick={() => setAddons(addons.filter((_, j) => j !== i))} />
        </div>
      ))}
      <AddBtn label="Add add-on" onClick={() => setAddons([...addons, { name: '', price: 0 }])} />
    </div>
  );
}

export default function ServiceSubdataEditor({ service, onSave, isSaving }: ServiceSubdataEditorProps) {
  const slug = service?.category?.slug ?? '';
  const [formData, setFormData] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [saved, setSaved] = useState(false);

  // Pre-fill from API data when service changes
  useEffect(() => {
    setFormData(extractSubdata(service));
  }, [service?.id]);

  if (!slug || slug === 'stationery') {
    return <div className="muted text-14 mt-20">No additional configuration required for this service type.</div>;
  }

  const handleSave = async () => {
    // Strip UI-only transient fields before sending to the API
    let payload = formData ?? {};
    if (slug === 'florist') {
      if (Array.isArray(payload.designs)) {
        payload = { ...payload, designs: payload.designs.map(({ _uploading: _, ...d }: any) => d) }; // eslint-disable-line @typescript-eslint/no-explicit-any
      }
      if (Array.isArray(payload.packages)) {
        payload = { ...payload, packages: payload.packages.map(({ _uploading: _, ...p }: any) => p) }; // eslint-disable-line @typescript-eslint/no-explicit-any
      }
    }
    if (slug === 'makeup' || slug === 'hair') {
      if (Array.isArray(payload.packages)) {
        payload = { ...payload, packages: payload.packages.map(({ _uploading: _, ...p }: any) => p) }; // eslint-disable-line @typescript-eslint/no-explicit-any
      }
    }
    if (slug === 'bride-dress') {
      if (Array.isArray(payload.extras)) {
        payload = { ...payload, extras: payload.extras.map(({ _uploading: _, ...e }: any) => e) }; // eslint-disable-line @typescript-eslint/no-explicit-any
      }
    }
    if (slug === 'invitation') {
      if (Array.isArray(payload.designs)) {
        payload = { ...payload, designs: payload.designs.map(({ _uploading: _, ...d }: any) => d) }; // eslint-disable-line @typescript-eslint/no-explicit-any
      }
    }
    await onSave(payload);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const categoryLabels: Record<string, string> = {
    'venue': 'Venue', 'catering': 'Catering', 'florist': 'Florist',
    'car-hire': 'Car Hire', 'photography': 'Photography', 'music': 'Music',
    'bride-dress': 'Bride Dress', 'groom-suite': 'Groom Suite', 'best-man': 'Best Man Suit',
    'bridesmaid': 'Bridesmaids', 'flower-girl': 'Flower Girl Dress', 'yacht': 'Yacht Hire',
    'bachelor': 'Bachelor Party', 'bachelorette': 'Bachelorette Party',
    'hotel': 'Hotel / Accommodation', 'bar': 'Bar Service', 'makeup': 'Make-up', 'hair': 'Hair Styling',
    'invitation': 'Invitation',
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ fontSize: 20 }}>{categoryLabels[slug] ?? slug} Details</h2>
          <p className="muted text-13 mt-4">Configure the service-specific options that customers will see when booking.</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={isSaving} style={{ minWidth: 110 }}>
          {saved ? '✓ Saved' : isSaving ? 'Saving…' : 'Save details'}
        </button>
      </div>

      <div className="mt-20">
        {slug === 'venue'        && <VenueForm       data={formData} onChange={setFormData} />}
        {slug === 'catering'     && <CateringForm     data={formData} onChange={setFormData} />}
        {slug === 'florist'      && <FloristForm      data={formData} onChange={setFormData} />}
        {slug === 'car-hire'     && <CarHireForm      data={formData} onChange={setFormData} />}
        {slug === 'photography'  && <PhotographyForm  data={formData} onChange={setFormData} />}
        {slug === 'music'        && <MusicForm        data={formData} onChange={setFormData} />}
        {slug === 'bride-dress'  && <BrideDressForm   data={formData} onChange={setFormData} />}
        {slug === 'groom-suite'  && <SuitForm         data={formData} onChange={setFormData} />}
        {slug === 'best-man'     && <SuitForm         data={formData} onChange={setFormData} />}
        {slug === 'bridesmaid'   && <BridesmaidForm   data={formData} onChange={setFormData} />}
        {slug === 'flower-girl'  && <FlowerGirlForm   data={formData} onChange={setFormData} />}
        {slug === 'yacht'        && <YachtForm        data={formData} onChange={setFormData} />}
        {slug === 'bachelor'     && <BachelorForm     data={formData} onChange={setFormData} />}
        {slug === 'bachelorette' && <BachelorForm     data={formData} onChange={setFormData} showSpa />}
        {slug === 'hotel'        && <HotelForm        data={formData} onChange={setFormData} />}
        {slug === 'bar'          && <BarForm          data={formData} onChange={setFormData} />}
        {slug === 'makeup'       && <MakeupForm       data={formData} onChange={setFormData} />}
        {slug === 'hair'         && <HairVendorForm   data={formData} onChange={setFormData} />}
        {slug === 'invitation'   && <InvitationForm   data={formData} onChange={setFormData} />}
      </div>
    </div>
  );
}
