// All 18 booking form components in one file
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../../../lib/api';
import Icon from '../../shared/Icon';
import {
  Label, FieldNote, FieldInput, Stepper, StepperField, SizeChips,
  PriceLine, RadioChip, CheckRow, CompactPick, TogglePair,
  FittingField, SizeRow, UploadField,
} from '../FormHelpers';
import { CITIES, IMG } from '../../../lib/data';
import type {
  Service, FormState, FormStateItem,
  VenueConfig, CateringConfig, FloristConfig, CarHireConfig,
  PhotographyConfig, MusicConfig, BrideDressConfig, GroomSuiteConfig,
  BridesmaidConfig, BestManConfig, FlowerGirlConfig, YachtConfig,
  BachelorConfig, BacheloretteConfig, HotelConfig, BarConfig, MakeupConfig,
} from '../../../lib/types';

type FormProps = { service: Service; onChange: (s: FormState) => void; initialPayload?: Record<string, unknown> };

// ─── 1. Venue
export function VenueForm({ service, onChange }: FormProps) {
  const v = service.venue as VenueConfig;
  const [people, setPeople] = useState(v.min);
  const [note, setNote] = useState('');
  const total = Math.max(v.minCost, people * v.pricePerPerson);
  useEffect(() => onChange({ total, summary: `${people} people · ${service.location}`, payload: { people, note } }), [people, note]);
  return (
    <div className="flex" style={{ flexDirection: 'column', gap: 22 }}>
      <PriceLine items={[['Price per Person', `€${v.pricePerPerson}`], ['Minimum cost', `€${v.minCost.toLocaleString()}`]]} />
      <div>
        <Label required>Number of People</Label>
        <div className="flex items-center gap-16 mt-8">
          <Stepper value={people} onChange={setPeople} min={v.min} max={v.max} />
          <span className="muted text-13">Min {v.min} · Max {v.max}</span>
        </div>
      </div>
      <FieldNote note={note} onChange={setNote} />
    </div>
  );
}

// ─── 2. Catering
export function CateringForm({ service, onChange }: FormProps) {
  const c = service.catering as CateringConfig;
  const [adults, setAdults] = useState(20);
  const [kids, setKids] = useState(0);
  const [activeCuisine, setActiveCuisine] = useState(0);
  const [picks, setPicks] = useState<Record<string, number[]>>({});
  const [note, setNote] = useState('');

  const togglePick = (cIdx: number, mIdx: number, item: number, max: number) => {
    const k = `${cIdx}-${mIdx}`;
    const list = picks[k] || [];
    if (list.includes(item)) setPicks({ ...picks, [k]: list.filter((x) => x !== item) });
    else if (list.length < max) setPicks({ ...picks, [k]: [...list, item] });
    else setPicks({ ...picks, [k]: [...list.slice(1), item] });
  };

  const total = useMemo(() => {
    let perPerson = 0;
    c.cuisines.forEach((cu, ci) => {
      cu.menus.forEach((m, mi) => {
        if ((picks[`${ci}-${mi}`] || []).length > 0) perPerson += m.price;
      });
    });
    return perPerson * (adults + kids * 0.5);
  }, [picks, adults, kids]);

  useEffect(() => onChange({ total, summary: `${adults} adults · ${kids} kids`, payload: { adults, kids, picks, note } }), [total, adults, kids, picks, note]);

  return (
    <div className="flex" style={{ flexDirection: 'column', gap: 22 }}>
      <div className="flex gap-16" style={{ flexWrap: 'wrap' }}>
        <StepperField label="Adults" required value={adults} onChange={setAdults} />
        <StepperField label="Kids" value={kids} onChange={setKids} />
      </div>
      <div>
        <div className="tabs">
          {c.cuisines.map((cu, i) => (
            <button key={i} onClick={() => setActiveCuisine(i)} className={`tab ${activeCuisine === i ? 'tab-active' : ''}`} style={{ background: 'transparent', border: 0 }}>
              {cu.name}
            </button>
          ))}
        </div>
        <div className="mt-20" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {c.cuisines[activeCuisine].menus.map((m, mi) => (
            <div key={mi}>
              <div className="flex items-center justify-between">
                <div className="fw-700">{m.name} <span className="muted fw-500 text-13">— choose {m.max} {m.max === 1 ? 'option' : 'options'}</span></div>
                <span className="chip chip-soft">€{m.price} / person</span>
              </div>
              <div className="grid mt-12" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {m.items.map((it, ii) => {
                  const sel = (picks[`${activeCuisine}-${mi}`] || []).includes(ii);
                  return <CompactPick key={ii} label={it} selected={sel} onClick={() => togglePick(activeCuisine, mi, ii, m.max)} />;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      <FieldNote note={note} onChange={setNote} />
    </div>
  );
}

// ─── 3. Florist
export function FloristForm({ service, onChange, initialPayload: ip }: FormProps) {
  const f = service.florist as FloristConfig;
  const [type, setType] = useState((ip?.type as string) ?? 'fresh');
  const [pkg, setPkg] = useState((ip?.pkg as string) ?? '');
  const [colors, setColors] = useState<string[]>((ip?.colors as string[]) ?? [f.colors[0], f.colors[1]].filter(Boolean));
  const [designs, setDesigns] = useState<string[]>((ip?.designs as string[]) ?? [f.designs[0]?.id].filter(Boolean));
  const [addons, setAddons] = useState<Record<string, number>>((ip?.addons as Record<string, number>) ?? {});
  const [note, setNote] = useState('');

  const total = useMemo(() => {
    const p = f.packages.find((x) => x.id === pkg)?.price || 0;
    const d = designs.reduce((s, id) => s + (f.designs.find((x) => x.id === id)?.price || 0), 0);
    const a = Object.entries(addons).reduce((s, [id, qty]) => {
      const addon = f.addons.find((x) => x.id === id);
      return s + qty * (addon?.price_per_unit || addon?.price || 0);
    }, 0);
    return p + d + a;
  }, [pkg, designs, addons]);

  useEffect(() => {
    const selPkg   = f.packages.find((p2) => p2.id === pkg);
    const selDesigns = f.designs.filter((d) => designs.includes(d.id));
    const addonItems = Object.entries(addons)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const a = f.addons.find((x) => x.id === id);
        return a ? { label: `${a.name} ×${qty}`, detail: `€${(qty * (a.price_per_unit ?? a.price ?? 0)).toLocaleString()}` } : null;
      })
      .filter(Boolean) as { label: string; detail: string }[];

    const items = [
      { label: 'Package', detail: selPkg?.name ?? '—' },
      { label: 'Type',    detail: type === 'fresh' ? 'Fresh flowers' : 'Artificial' },
      ...(colors.length > 0 ? [{ label: 'Colours', detail: `${colors.length} selected` }] : []),
      ...selDesigns.map((d) => ({ label: `Design: ${d.name}`, detail: d.price > 0 ? `+€${d.price.toLocaleString()}` : 'Included' })),
      ...addonItems,
    ];

    onChange({ total, summary: `${selPkg?.name} · ${colors.length} colors`, payload: { type, pkg, colors, designs, addons, note }, items });
  }, [total, type, pkg, colors, designs, addons, note]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleColor = (c: string) => setColors((cs) => cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]);
  const toggleDesign = (id: string) => setDesigns((ds) => ds.includes(id) ? ds.filter((x) => x !== id) : [...ds, id]);

  return (
    <div className="flex" style={{ flexDirection: 'column', gap: 24 }}>
      <div>
        <Label required>Fresh or artificial</Label>
        <div className="mt-8">
          <TogglePair value={type} onChange={setType} options={[{ value: 'fresh', label: 'Fresh Flowers' }, { value: 'fake', label: 'Artificial' }]} />
        </div>
      </div>
      <div>
        <Label required>Select a package</Label>
        <div className="flex" style={{ flexDirection: 'column', gap: 10, marginTop: 8 }}>
          {f.packages.map((p) => (
            <div key={p.id} onClick={() => setPkg(pkg === p.id ? '' : p.id)} style={{ cursor: 'pointer',
              border: `1px solid ${pkg === p.id ? 'var(--primary)' : 'transparent'}`,
              background: pkg === p.id ? 'var(--primary-50)' : '#eaf8f8', borderRadius: 14, padding: 16 }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  {p.tier && (
                    <span className={`chip ${p.tier === 'bronze' ? 'chip-amber' : p.tier === 'silver' ? 'chip-soft' : 'chip-blue'}`} style={{ textTransform: 'capitalize' }}>
                      {p.tier}
                    </span>
                  )}
                  <span className="fw-700">{p.name}</span>
                </div>
                <span className="fw-700">€{p.price.toLocaleString()}</span>
              </div>
              {p.features.length > 0 && (
                <div className="flex gap-8 mt-12" style={{ flexWrap: 'wrap' }}>
                  {p.features.map((ft) => <span key={ft} className="chip" style={{ background: 'white', fontSize: 11 }}>{ft}</span>)}
                </div>
              )}
              {p.images?.length > 0 && (
                <div className="flex gap-8 mt-10" style={{ flexWrap: 'wrap' }}>
                  {p.images.map((url, ii) => (
                    <img key={ii} src={url} alt="" style={{ width: 100, height: 100, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label required>Colours</Label>
        <div className="flex gap-8 mt-8">
          {f.colors.map((c) => (
            <button key={c} type="button" onClick={() => toggleColor(c)}
              style={{ width: 32, height: 32, borderRadius: 999, background: c, border: '3px solid white',
                outline: colors.includes(c) ? '2px solid var(--ink)' : '1px solid var(--line)' }} />
          ))}
        </div>
      </div>
      <div>
        <Label required>Designs (select at least one)</Label>
        <div className="grid mt-8" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {f.designs.map((d) => {
            const on = designs.includes(d.id);
            return (
              <div key={d.id} onClick={() => toggleDesign(d.id)}
                style={{ cursor: 'pointer', borderRadius: 14, overflow: 'hidden', border: `2px solid ${on ? 'var(--primary)' : 'transparent'}`, background: 'white' }}>
                <img src={d.image} alt={d.name} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />
                <div style={{ padding: '8px 10px' }}>
                  <div className="text-12 fw-600">{d.name}</div>
                  <div className="text-12 muted">€{d.price}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <Label>Add-ons</Label>
        <div className="flex" style={{ flexDirection: 'column', gap: 8, marginTop: 8 }}>
          {f.addons.map((a) => {
            const qty = addons[a.id] || 0;
            return (
              <div key={a.id} className="flex items-center justify-between"
                style={{ padding: '12px 16px', border: '1px solid var(--line)', borderRadius: 14, background: 'white' }}>
                <div>
                  <div className="fw-600 text-14">{a.name}</div>
                  <div className="text-12 muted">€{a.price_per_unit || a.price} per {a.unit || 'piece'}</div>
                </div>
                <Stepper value={qty} onChange={(v) => setAddons({ ...addons, [a.id]: v })} />
              </div>
            );
          })}
        </div>
      </div>
      <UploadField label="Upload your inspiration" />
      <FieldNote note={note} onChange={setNote} />
    </div>
  );
}

// ─── 4. Car Hire
function LocationTime({ title, value, onChange }: { title: string; value: { loc: string; time: string; ampm: string }; onChange: (v: { loc: string; time: string; ampm: string }) => void }) {
  return (
    <div>
      <Label>{title}</Label>
      <input className="input mt-8" placeholder="Location" value={value.loc} onChange={(e) => onChange({ ...value, loc: e.target.value })} />
      <div className="flex gap-8 mt-8">
        <input className="input" type="time" value={value.time} onChange={(e) => onChange({ ...value, time: e.target.value })} />
        <select className="select" value={value.ampm} onChange={(e) => onChange({ ...value, ampm: e.target.value })} style={{ width: 80 }}>
          <option>AM</option><option>PM</option>
        </select>
      </div>
    </div>
  );
}

export function CarHireForm({ service, onChange }: FormProps) {
  const c = service.carHire as CarHireConfig;
  const [hours, setHours] = useState(c.hours[0].id);
  const [pickup, setPickup] = useState({ loc: '', time: '14:00', ampm: 'PM' });
  const [dropoff, setDropoff] = useState({ loc: '', time: '20:00', ampm: 'PM' });
  const [addons, setAddons] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const total = c.hours.find((h) => h.id === hours)?.price || 0;
  useEffect(() => onChange({ total, summary: c.hours.find((h) => h.id === hours)?.label || '', payload: { hours, pickup, dropoff, addons, note } }), [total, hours, pickup, dropoff, addons, note]);
  return (
    <div className="flex" style={{ flexDirection: 'column', gap: 22 }}>
      <div>
        <Label required>Hire hours</Label>
        <div className="grid mt-8" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {c.hours.map((h) => (
            <RadioChip key={h.id} selected={hours === h.id} onClick={() => setHours(h.id)}>
              <div className="fw-700">{h.label}</div>
              <div className="muted text-12">€{h.price}</div>
            </RadioChip>
          ))}
        </div>
      </div>
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <LocationTime title="Pick-up" value={pickup} onChange={setPickup} />
        <LocationTime title="Drop-off" value={dropoff} onChange={setDropoff} />
      </div>
      <div>
        <Label>Add-ons</Label>
        <div className="flex gap-8 mt-8" style={{ flexWrap: 'wrap' }}>
          {c.addons.map((a) => (
            <button key={a.id} type="button"
              onClick={() => setAddons((s) => s.includes(a.id) ? s.filter((x) => x !== a.id) : [...s, a.id])}
              className={`chip chip-selectable ${addons.includes(a.id) ? 'chip-selected' : ''}`}>
              {a.name}
            </button>
          ))}
        </div>
      </div>
      <FieldNote note={note} onChange={setNote} />
    </div>
  );
}

// ─── 5. Photography
export function PhotographyForm({ service, onChange }: FormProps) {
  const p = service.photography as PhotographyConfig;
  const [pkg, setPkg] = useState(p.packages[1].id);
  const [addons, setAddons] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const total = useMemo(() => {
    const base = p.packages.find((x) => x.id === pkg)?.price || 0;
    const aPrice = (p.packages.find((x) => x.id === pkg)?.addons || [])
      .filter((a) => addons.includes(a.id)).reduce((s, a) => s + a.price, 0);
    return base + aPrice;
  }, [pkg, addons]);
  useEffect(() => onChange({ total, summary: p.packages.find((x) => x.id === pkg)?.name || '', payload: { pkg, addons, note } }), [total, pkg, addons, note]);
  const activePkg = p.packages.find((x) => x.id === pkg)!;
  return (
    <div className="flex" style={{ flexDirection: 'column', gap: 22 }}>
      <div>
        <Label required>Choose your package</Label>
        <div className="grid mt-8" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {p.packages.map((pp) => {
            const on = pkg === pp.id;
            return (
              <div key={pp.id} onClick={() => setPkg(pp.id)}
                style={{ cursor: 'pointer', border: `1px solid ${on ? 'var(--primary)' : 'var(--line)'}`, background: on ? 'var(--primary-50)' : 'white', borderRadius: 16, padding: 16 }}>
                <div className="flex items-center justify-between">
                  <span className="chip">{pp.name}</span>
                  {on && <Icon name="check" size={16} color="var(--primary)" />}
                </div>
                <div className="fw-700 mt-12" style={{ fontSize: 24 }}>€{pp.price.toLocaleString()}</div>
                <ul className="mt-12" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {pp.includes.map((i) => <li key={i} className="text-12 flex items-center gap-6"><Icon name="check" size={12} color="var(--primary)" /> {i}</li>)}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
      {activePkg.addons.length > 0 && (
        <div>
          <Label>Optional add-ons</Label>
          <div className="flex" style={{ flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {activePkg.addons.map((a) => (
              <CheckRow key={a.id} checked={addons.includes(a.id)}
                onChange={() => setAddons((s) => s.includes(a.id) ? s.filter((x) => x !== a.id) : [...s, a.id])}
                label={a.name} price={a.price} />
            ))}
          </div>
        </div>
      )}
      <FieldNote note={note} onChange={setNote} />
    </div>
  );
}

// ─── 6. Music
export function MusicForm({ service, onChange }: FormProps) {
  const m = service.music as MusicConfig;
  const [hours, setHours] = useState(m.minimumHours);
  const [entrance, setEntrance] = useState('');
  const [firstDance, setFirstDance] = useState('');
  const [cake, setCake] = useState('');
  const [songsList, setSongsList] = useState('');
  const [details, setDetails] = useState('');
  const total = hours * m.pricePerHour;
  useEffect(() => onChange({ total, summary: `${hours} hours`, payload: { hours, entrance, firstDance, cake, songsList, details } }), [total, hours, entrance, firstDance, cake, songsList, details]);
  return (
    <div className="flex" style={{ flexDirection: 'column', gap: 22 }}>
      <div>
        <Label required>How many hours? <span className="muted fw-500 text-12">(min {m.minimumHours})</span></Label>
        <div className="flex items-center gap-16 mt-8">
          <Stepper value={hours} onChange={setHours} min={m.minimumHours} max={12} />
          <span className="muted text-13">€{m.pricePerHour}/hour</span>
        </div>
      </div>
      <div style={{ aspectRatio: '16/9', borderRadius: 14, overflow: 'hidden', background: 'var(--bg-3)', position: 'relative' }}>
        <img src={IMG('1511192336575-5a79af67a629', 800, 450)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
          <button style={{ width: 56, height: 56, borderRadius: 999, background: 'rgba(255,255,255,.95)', border: 0, display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
            <Icon name="play" size={22} color="var(--ink)" />
          </button>
        </div>
      </div>
      <FieldInput label="Entrance song" value={entrance} onChange={setEntrance} />
      <FieldInput label="First Dance song" value={firstDance} onChange={setFirstDance} />
      <FieldInput label="Cake-cutting song" value={cake} onChange={setCake} hint="at least one suggestion required" />
      <div>
        <Label>List of songs you'd like</Label>
        <textarea className="textarea mt-8" rows={4} value={songsList} onChange={(e) => setSongsList(e.target.value)} placeholder="One song per line…" />
      </div>
      <div>
        <Label>Further details</Label>
        <textarea className="textarea mt-8" rows={3} value={details} onChange={(e) => setDetails(e.target.value)} />
      </div>
    </div>
  );
}

// ─── 7. Bride Dress
export function BrideDressForm({ service, onChange }: FormProps) {
  const b = service.brideDress as BrideDressConfig;
  const [type, setType] = useState('rent');
  const [size, setSize] = useState('M');
  const [fit1, setFit1] = useState({ date: '2026-06-15', time: '14:00' });
  const [fit2, setFit2] = useState({ date: '2026-07-20', time: '14:00' });
  const [extras, setExtras] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const total = (type === 'rent' ? b.priceRent : b.priceBuy) + extras.reduce((s, id) => s + (b.extras.find((e) => e.id === id)?.price || 0), 0);
  useEffect(() => onChange({ total, summary: `${type === 'rent' ? 'Rent' : 'Buy'} · size ${size}`, payload: { type, sizes: [size], fit1, fit2, extras, note } }), [total, type, size, fit1, fit2, extras, note]);
  return (
    <div className="flex" style={{ flexDirection: 'column', gap: 22 }}>
      <div>
        <Label required>Rent or buy</Label>
        <div className="mt-8">
          <TogglePair value={type} onChange={setType} options={[{ value: 'rent', label: `Rent a Dress · €${b.priceRent}` }, { value: 'buy', label: `Buy a Dress · €${b.priceBuy}` }]} />
        </div>
      </div>
      <div>
        <Label required>Pick a size</Label>
        <div className="mt-8"><SizeChips options={b.sizes} value={size} onChange={(v) => setSize(v as string)} /></div>
      </div>
      <div className="grid fit-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <FittingField label="Day of 1st fitting" value={fit1} onChange={setFit1} required />
        <FittingField label="Day of 2nd fitting" value={fit2} onChange={setFit2} />
      </div>
      <div>
        <Label>Add-ons</Label>
        <div className="flex gap-8 mt-8" style={{ flexWrap: 'wrap' }}>
          {b.extras.map((e) => {
            const on = extras.includes(e.id);
            return (
              <button key={e.id} type="button"
                onClick={() => setExtras((s) => s.includes(e.id) ? s.filter((x) => x !== e.id) : [...s, e.id])}
                className={`chip chip-selectable ${on ? 'chip-selected' : ''}`}
                style={e.image ? { paddingLeft: 4, display: 'inline-flex', alignItems: 'center', gap: 8 } : undefined}>
                {e.image && (
                  <img src={e.image} alt="" style={{ width: 28, height: 28, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                )}
                <span>{e.name} · €{e.price}</span>
              </button>
            );
          })}
        </div>
      </div>
      <FieldNote note={note} onChange={setNote} />
    </div>
  );
}

// ─── 8. Groom Suite
export function GroomSuiteForm({ service, onChange }: FormProps) {
  const g = (service.groomSuite || service.bestMan) as GroomSuiteConfig;
  const [type, setType] = useState('rent');
  const [jacket, setJacket] = useState('M');
  const [vest, setVest] = useState('M');
  const [shirt, setShirt] = useState('M');
  const [bottom, setBottom] = useState('M');
  const [fit1, setFit1] = useState({ date: '2026-06-15', time: '14:00' });
  const [fit2, setFit2] = useState({ date: '2026-07-20', time: '14:00' });
  const [note, setNote] = useState('');
  const total = type === 'rent' ? g.priceRent : g.priceBuy;
  useEffect(() => onChange({ total, summary: `${type === 'rent' ? 'Rent' : 'Buy'} · J:${jacket}, V:${vest}, S:${shirt}, B:${bottom}`, payload: { type, jacket, vest, shirt, bottom, fit1, fit2, note } }), [total, type, jacket, vest, shirt, bottom, fit1, fit2, note]);
  return (
    <div className="flex" style={{ flexDirection: 'column', gap: 22 }}>
      <div>
        <Label required>Rent or buy</Label>
        <div className="mt-8">
          <TogglePair value={type} onChange={setType} options={[{ value: 'rent', label: `Rent a Suit · €${g.priceRent}` }, { value: 'buy', label: `Buy a Suit · €${g.priceBuy}` }]} />
        </div>
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        <SizeRow label="Jacket size" value={jacket} onChange={setJacket} options={g.jacket} />
        <SizeRow label="Vest size"   value={vest}   onChange={setVest}   options={g.vest} />
        <SizeRow label="Bottom size" value={bottom} onChange={setBottom} options={g.bottom} />
        <SizeRow label="Shirt size"  value={shirt}  onChange={setShirt}  options={g.shirt} />
      </div>
      <div className="grid fit-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <FittingField label="Day of 1st fitting" value={fit1} onChange={setFit1} required />
        <FittingField label="Day of 2nd fitting" value={fit2} onChange={setFit2} />
      </div>
      <FieldNote note={note} onChange={setNote} />
    </div>
  );
}

// ─── 9. Bridesmaid
export function BridesmaidForm({ service, onChange }: FormProps) {
  const b = service.bridesmaid as BridesmaidConfig;
  const [sizes, setSizes] = useState<Record<string, number>>({ S: 0, M: 2, L: 0 });
  const [note, setNote] = useState('');
  const total = Object.values(sizes).reduce((s, q) => s + q, 0) * b.price;
  useEffect(() => onChange({ total, summary: `${Object.values(sizes).reduce((s, q) => s + q, 0)} dresses`, payload: { sizes, note } }), [total, sizes, note]);
  return (
    <div className="flex" style={{ flexDirection: 'column', gap: 22 }}>
      <PriceLine items={[['Price per dress', `€${b.price}`]]} />
      <div>
        <Label required>Quantity by size</Label>
        <div className="flex" style={{ flexDirection: 'column', gap: 8, marginTop: 8 }}>
          {b.sizes.map((s) => (
            <div key={s} className="flex items-center justify-between"
              style={{ padding: '12px 16px', border: '1px solid var(--line)', borderRadius: 12, background: 'white' }}>
              <span className="fw-600">Size {s}</span>
              <Stepper value={sizes[s] || 0} onChange={(v) => setSizes({ ...sizes, [s]: v })} />
            </div>
          ))}
        </div>
      </div>
      <FieldNote note={note} onChange={setNote} />
    </div>
  );
}

// ─── 10. Best Man (re-uses GroomSuite)
export function BestManForm({ service, onChange }: FormProps) {
  return <GroomSuiteForm service={{ ...service, groomSuite: service.bestMan as BestManConfig }} onChange={onChange} />;
}

// ─── 11. Flower Girl
export function FlowerGirlForm({ service, onChange }: FormProps) {
  const f = service.flowerGirl as FlowerGirlConfig;
  const [age, setAge] = useState(f.sizes[1]);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState('');
  const total = f.price * qty;
  useEffect(() => onChange({ total, summary: `${qty} × ${age}`, payload: { age, qty, note } }), [total, age, qty, note]);
  return (
    <div className="flex" style={{ flexDirection: 'column', gap: 22 }}>
      <PriceLine items={[['Price per dress', `€${f.price}`]]} />
      <div>
        <Label required>Age / size group</Label>
        <div className="mt-8"><SizeChips options={f.sizes} value={age} onChange={(v) => setAge(v as string)} /></div>
      </div>
      <div>
        <Label>Quantity</Label>
        <div className="mt-8"><Stepper value={qty} onChange={setQty} min={1} /></div>
      </div>
      <FieldNote note={note} onChange={setNote} />
    </div>
  );
}

// ─── 12. Yacht
export function YachtForm({ service, onChange }: FormProps) {
  const y = service.yacht as YachtConfig;
  const [hours, setHours] = useState(y.hours[0].id);
  const [note, setNote] = useState('');
  const total = y.hours.find((h) => h.id === hours)?.price || 0;
  useEffect(() => onChange({ total, summary: y.hours.find((h) => h.id === hours)?.label || '', payload: { hours, note } }), [total, hours, note]);
  const specs: [string, string][] = [
    ['People', `${y.min}–${y.max}`],
    ['Speed', y.speed],
    ['Length', y.length],
    ['Cabin crew', `${y.cabinCrew}`],
    ['Washrooms', `${y.washroom}`],
    ['Showers', `${y.shower}`],
    ['Chef', y.chef ? 'Included' : 'Not included'],
  ];
  return (
    <div className="flex" style={{ flexDirection: 'column', gap: 22 }}>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, padding: '14px 16px', background: 'var(--bg-2)', borderRadius: 14 }}>
        {specs.map(([k, v]) => (
          <div key={k} className="flex items-center gap-8 text-13">
            <span style={{ color: 'var(--primary)' }}><Icon name="yacht" size={16} /></span>
            <span className="muted">{k}:</span>
            <span className="fw-600">{v}</span>
          </div>
        ))}
      </div>
      <div>
        <Label required>Hire hours</Label>
        <div className="grid mt-8" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {y.hours.map((h) => (
            <RadioChip key={h.id} selected={hours === h.id} onClick={() => setHours(h.id)}>
              <div className="fw-700">{h.label}</div>
              <div className="muted text-12">€{h.price.toLocaleString()}</div>
            </RadioChip>
          ))}
        </div>
      </div>
      <FieldNote note={note} onChange={setNote} />
    </div>
  );
}

// ─── 13 & 14. Bachelor / Bachelorette (shared layout)
function BachelorLikeForm({ title, includes, people, setPeople, hours, setHours, selected, setSelected, note, setNote, pricePerHour }: {
  title: string; includes: { id: string; name: string; price: number; icon: string }[];
  people: number; setPeople: (v: number) => void;
  hours: number; setHours: (v: number) => void;
  selected: string[]; setSelected: (v: string[]) => void;
  note: string; setNote: (v: string) => void;
  pricePerHour: number;
}) {
  return (
    <div className="flex" style={{ flexDirection: 'column', gap: 22 }}>
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <StepperField label={title} required value={people} onChange={setPeople} />
        <StepperField label="Hours" required value={hours} onChange={setHours} />
      </div>
      <div>
        <Label required>At least select one</Label>
        <div className="flex" style={{ flexDirection: 'column', gap: 8, marginTop: 8 }}>
          {includes.map((i) => (
            <CheckRow key={i.id} checked={selected.includes(i.id)}
              onChange={() => setSelected(selected.includes(i.id) ? selected.filter((x) => x !== i.id) : [...selected, i.id])}
              label={i.name} sub="Per person" price={i.price} icon={i.icon} />
          ))}
        </div>
      </div>
      <FieldNote note={note} onChange={setNote} />
      <div className="text-12 muted">+ €{pricePerHour}/hour coordination fee included in total.</div>
    </div>
  );
}

export function BachelorForm({ service, onChange }: FormProps) {
  const b = service.bachelor as BachelorConfig;
  const [people, setPeople] = useState(8);
  const [hours, setHours] = useState(6);
  const [includes, setIncludes] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const total = useMemo(() => {
    const pp = includes.reduce((s, id) => s + (b.includes.find((i) => i.id === id)?.price || 0), 0);
    return pp * people + hours * b.pricePerHour;
  }, [people, hours, includes]);
  useEffect(() => onChange({ total, summary: `${people} boys · ${hours}h`, payload: { people, hours, includes, note } }), [total, people, hours, includes, note]);
  return <BachelorLikeForm title="Number of Boys" includes={b.includes} people={people} setPeople={setPeople} hours={hours} setHours={setHours} selected={includes} setSelected={setIncludes} note={note} setNote={setNote} pricePerHour={b.pricePerHour} />;
}

export function BacheloretteForm({ service, onChange }: FormProps) {
  const b = service.bachelorette as BacheloretteConfig;
  const [people, setPeople] = useState(8);
  const [hours, setHours] = useState(6);
  const [includes, setIncludes] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const total = useMemo(() => {
    const pp = includes.reduce((s, id) => s + (b.includes.find((i) => i.id === id)?.price || 0), 0);
    return pp * people + hours * b.pricePerHour;
  }, [people, hours, includes]);
  useEffect(() => onChange({ total, summary: `${people} girls · ${hours}h`, payload: { people, hours, includes, note } }), [total, people, hours, includes, note]);
  return <BachelorLikeForm title="Number of Girls" includes={b.includes} people={people} setPeople={setPeople} hours={hours} setHours={setHours} selected={includes} setSelected={setIncludes} note={note} setNote={setNote} pricePerHour={b.pricePerHour} />;
}

// ─── 15. Hotel
export function HotelForm({ service, onChange }: FormProps) {
  const h = service.hotel as HotelConfig;
  const [tab, setTab] = useState('Hotel');
  const [arrival, setArrival] = useState('2026-06-20');
  const [departure, setDeparture] = useState('2026-06-23');
  const [roomId, setRoomId] = useState(h.rooms[0].id);
  const [facilities, setFacilities] = useState<string[]>([]);

  const nights = Math.max(1, Math.round((new Date(departure).getTime() - new Date(arrival).getTime()) / 86400000));
  const total = useMemo(() => {
    const room = h.rooms.find((r) => r.id === roomId);
    const fac = facilities.reduce((s, id) => s + (h.facilities.find((f) => f.id === id)?.price || 0), 0);
    return (room?.pricePerNight || 0) * nights + fac;
  }, [roomId, nights, facilities]);
  useEffect(() => onChange({ total, summary: `${nights} nights · ${h.rooms.find((r) => r.id === roomId)?.name}`, payload: { arrival, departure, roomId, facilities } }), [total, arrival, departure, roomId, facilities]);

  return (
    <div className="flex" style={{ flexDirection: 'column', gap: 22 }}>
      <div className="tabs">
        {['Hotel', 'Facilities'].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`tab ${tab === t ? 'tab-active' : ''}`} style={{ background: 'transparent', border: 0 }}>{t}</button>
        ))}
      </div>
      {tab === 'Hotel' && (
        <>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div><Label required>Arrival date</Label><input className="input mt-8" type="date" value={arrival} onChange={(e) => setArrival(e.target.value)} /></div>
            <div><Label required>Departure date</Label><input className="input mt-8" type="date" value={departure} onChange={(e) => setDeparture(e.target.value)} /></div>
          </div>
          <div>
            <Label required>Choose a room</Label>
            <div className="flex" style={{ flexDirection: 'column', gap: 12, marginTop: 8 }}>
              {h.rooms.map((r) => {
                const on = roomId === r.id;
                return (
                  <div key={r.id} onClick={() => setRoomId(r.id)}
                    style={{ cursor: 'pointer', display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: 14, padding: 12,
                      border: `1px solid ${on ? 'var(--primary)' : 'var(--line)'}`, background: on ? 'var(--primary-50)' : 'white', borderRadius: 14 }}>
                    <img src={r.images[0]} alt={r.name} style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 10 }} />
                    <div>
                      <div className="fw-700 text-14">{r.name}</div>
                      <div className="muted text-12 mt-4">Max {r.maxAdults} adults · {r.maxKids} kids</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="fw-700 text-15">€{r.pricePerNight}</div>
                      <div className="muted text-12">/ night</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
      {tab === 'Facilities' && (
        <div>
          <Label>Add-on facilities</Label>
          <div className="flex" style={{ flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {h.facilities.map((f) => (
              <CheckRow key={f.id} checked={facilities.includes(f.id)}
                onChange={() => setFacilities((s) => s.includes(f.id) ? s.filter((x) => x !== f.id) : [...s, f.id])}
                label={f.name} price={f.price} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 16. Bar
export function BarForm({ service, onChange }: FormProps) {
  const b = service.bar as BarConfig;
  const [people, setPeople] = useState(40);
  const [hours, setHours] = useState(4);
  const [city, setCity] = useState<string | number>(CITIES[0].id);
  const [address, setAddress] = useState('');
  const [menus, setMenus] = useState<Record<string, number[]>>({});
  const [note, setNote] = useState('');

  const { data: apiCities } = useQuery({
    queryKey: ['cities'],
    queryFn: () => publicApi.cities(),
    staleTime: 10 * 60 * 1000,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cityList: { id: number | string; name: string }[] =
    Array.isArray(apiCities) && apiCities.length > 0
      ? (apiCities as any[]).map((c) => ({ id: c.id ?? c, name: c.name ?? c }))
      : CITIES;

  const total = useMemo(() => Object.entries(menus).reduce((s, [mid, items]) =>
    s + (items.length > 0 ? (b.menus.find((m) => m.id === mid)?.price || 0) : 0), 0), [menus]);
  useEffect(() => onChange({ total, summary: `${people} ppl · ${hours}h`, payload: { people, hours, city, address, menus, note } }), [total, people, hours, city, address, menus, note]);

  const toggleItem = (mid: string, idx: number) => {
    const list = menus[mid] || [];
    setMenus({ ...menus, [mid]: list.includes(idx) ? list.filter((x) => x !== idx) : [...list, idx] });
  };

  return (
    <div className="flex" style={{ flexDirection: 'column', gap: 22 }}>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        <StepperField label="People" required value={people} onChange={setPeople} />
        <StepperField label="Hours"  required value={hours} onChange={setHours} />
        <div>
          <Label required>City</Label>
          <select className="select mt-8" value={city} onChange={(e) => setCity(e.target.value)}>
            {cityList.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <Label>Address</Label>
          <input className="input mt-8" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, area" />
        </div>
      </div>
      {b.menus.map((m) => (
        <div key={m.id}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <span className="chip chip-soft">{m.name}</span>
              <span className="fw-600">€{m.price}</span>
            </div>
            <span className="muted text-12">{m.items.length} items</span>
          </div>
          <div className="grid mt-8" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {m.items.map((it, ii) => (
              <CompactPick key={ii} label={it} selected={(menus[m.id] || []).includes(ii)} onClick={() => toggleItem(m.id, ii)} />
            ))}
          </div>
        </div>
      ))}
      <FieldNote note={note} onChange={setNote} />
    </div>
  );
}

// ─── 17. Make-up
export function MakeupForm({ service, onChange }: FormProps) {
  const mk = service.makeup as MakeupConfig;
  const [selected, setSelected] = useState<Record<string, { on: boolean; date: string; time: string }>>({});
  const [note, setNote] = useState('');
  const total = useMemo(() => mk.packages.reduce((s, p) => s + (selected[p.id]?.on ? p.price : 0), 0), [selected]);
  const summary = mk.packages.filter((p) => selected[p.id]?.on).map((p) => p.name).join(' + ') || 'No packages';
  useEffect(() => onChange({ total, summary, payload: { selected, note } }), [total, selected, note]);
  return (
    <div className="flex" style={{ flexDirection: 'column', gap: 14 }}>
      <Label required>Select your packages</Label>
      <div className="flex" style={{ flexDirection: 'column', gap: 10 }}>
        {mk.packages.map((p) => {
          const s = selected[p.id] || { on: false, date: '2026-06-15', time: '10:00' };
          const imgs: string[] = Array.isArray(p.images) ? p.images : [];
          const feats: string[] = Array.isArray(p.features) ? p.features : [];
          return (
            <div key={p.id}
              onClick={() => setSelected({ ...selected, [p.id]: { ...s, on: !s.on } })}
              style={{ cursor: 'pointer', border: `1px solid ${s.on ? 'var(--primary)' : 'transparent'}`,
                background: s.on ? 'var(--primary-50)' : '#eaf8f8', borderRadius: 14, padding: 16 }}>
              {/* Header — tier + name on left, price on right */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  {p.tier && (
                    <span className={`chip ${p.tier === 'bronze' ? 'chip-amber' : p.tier === 'silver' ? 'chip-soft' : 'chip-blue'}`}
                      style={{ textTransform: 'capitalize' }}>
                      {p.tier}
                    </span>
                  )}
                  <span className="fw-700">{p.name}</span>
                </div>
                <span className="fw-700" style={{ color: 'var(--primary)' }}>€{Number(p.price).toLocaleString()}</span>
              </div>
              {/* Feature chips */}
              {feats.length > 0 && (
                <div className="flex gap-8 mt-12" style={{ flexWrap: 'wrap' }}>
                  {feats.map((ft) => (
                    <span key={ft} className="chip" style={{ background: 'white', fontSize: 11 }}>{ft}</span>
                  ))}
                </div>
              )}
              {/* Package photos */}
              {imgs.length > 0 && (
                <div className="flex gap-8 mt-10" style={{ flexWrap: 'wrap' }}>
                  {imgs.map((url, ii) => (
                    <img key={ii} src={url} alt=""
                      style={{ width: 100, height: 100, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                  ))}
                </div>
              )}
              {/* Date/time when selected */}
              {s.on && (
                <div className="flex gap-8 mt-12" onClick={(e) => e.stopPropagation()}>
                  <input className="input" type="date" value={s.date}
                    onChange={(e) => setSelected({ ...selected, [p.id]: { ...s, date: e.target.value } })} />
                  <input className="input" type="time" value={s.time}
                    onChange={(e) => setSelected({ ...selected, [p.id]: { ...s, time: e.target.value } })}
                    style={{ width: 110 }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <FieldNote note={note} onChange={setNote} />
    </div>
  );
}

// ─── 18. Hair
export function HairForm({ service, onChange }: FormProps) {
  const hc = service.hair as MakeupConfig;
  const [selected, setSelected] = useState<Record<string, { on: boolean; date: string; time: string }>>({});
  const [note, setNote] = useState('');
  const total = useMemo(() => hc.packages.reduce((s, p) => s + (selected[p.id]?.on ? p.price : 0), 0), [selected]);
  const summary = hc.packages.filter((p) => selected[p.id]?.on).map((p) => p.name).join(' + ') || 'No packages';
  useEffect(() => onChange({ total, summary, payload: { selected, note } }), [total, selected, note]);
  return (
    <div className="flex" style={{ flexDirection: 'column', gap: 14 }}>
      <Label required>Select your packages</Label>
      <div className="flex" style={{ flexDirection: 'column', gap: 10 }}>
        {hc.packages.map((p) => {
          const s = selected[p.id] || { on: false, date: '2026-06-15', time: '10:00' };
          const imgs: string[] = Array.isArray(p.images) ? p.images : [];
          const feats: string[] = Array.isArray(p.features) ? p.features : [];
          return (
            <div key={p.id}
              onClick={() => setSelected({ ...selected, [p.id]: { ...s, on: !s.on } })}
              style={{ cursor: 'pointer', border: `1px solid ${s.on ? 'var(--primary)' : 'transparent'}`,
                background: s.on ? 'var(--primary-50)' : '#eaf8f8', borderRadius: 14, padding: 16 }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  {p.tier && (
                    <span className={`chip ${p.tier === 'bronze' ? 'chip-amber' : p.tier === 'silver' ? 'chip-soft' : 'chip-blue'}`}
                      style={{ textTransform: 'capitalize' }}>
                      {p.tier}
                    </span>
                  )}
                  <span className="fw-700">{p.name}</span>
                </div>
                <span className="fw-700" style={{ color: 'var(--primary)' }}>€{Number(p.price).toLocaleString()}</span>
              </div>
              {feats.length > 0 && (
                <div className="flex gap-8 mt-12" style={{ flexWrap: 'wrap' }}>
                  {feats.map((ft) => (
                    <span key={ft} className="chip" style={{ background: 'white', fontSize: 11 }}>{ft}</span>
                  ))}
                </div>
              )}
              {imgs.length > 0 && (
                <div className="flex gap-8 mt-10" style={{ flexWrap: 'wrap' }}>
                  {imgs.map((url, ii) => (
                    <img key={ii} src={url} alt=""
                      style={{ width: 100, height: 100, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                  ))}
                </div>
              )}
              {s.on && (
                <div className="flex gap-8 mt-12" onClick={(e) => e.stopPropagation()}>
                  <input className="input" type="date" value={s.date}
                    onChange={(e) => setSelected({ ...selected, [p.id]: { ...s, date: e.target.value } })} />
                  <input className="input" type="time" value={s.time}
                    onChange={(e) => setSelected({ ...selected, [p.id]: { ...s, time: e.target.value } })}
                    style={{ width: 110 }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <FieldNote note={note} onChange={setNote} />
    </div>
  );
}

// ─── Form map (slug → component)
import type { ComponentType } from 'react';
export const BOOKING_FORM_MAP: Record<string, ComponentType<FormProps>> = {
  'venue':        VenueForm,
  'catering':     CateringForm,
  'florist':      FloristForm,
  'car-hire':     CarHireForm,
  'photography':  PhotographyForm,
  'music':        MusicForm,
  'bride-dress':  BrideDressForm,
  'groom-suite':  GroomSuiteForm,
  'bridesmaid':   BridesmaidForm,
  'best-man':     BestManForm,
  'flower-girl':  FlowerGirlForm,
  'yacht':        YachtForm,
  'bachelor':     BachelorForm,
  'bachelorette': BacheloretteForm,
  'hotel':        HotelForm,
  'bar':          BarForm,
  'makeup':       MakeupForm,
  'hair':         HairForm,
};
