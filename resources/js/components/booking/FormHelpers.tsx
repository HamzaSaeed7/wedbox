// Shared form primitives used across all 18 booking forms
import React, { useState, useEffect } from 'react';
import Icon from '../shared/Icon';

// ─── Label
export function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="field-label" style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>
      {children}{required && <span style={{ color: '#E11D48', marginLeft: 4 }}>*</span>}
    </label>
  );
}

// ─── Notes field
export function FieldNote({ note, onChange }: { note: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label>Notes</Label>
      <textarea className="textarea mt-8" value={note} onChange={(e) => onChange(e.target.value)} placeholder="Anything we should know?" />
    </div>
  );
}

// ─── Text input field
export function FieldInput({
  label, value, onChange, hint, required, type = 'text',
}: {
  label: string; value: string; onChange: (v: string) => void;
  hint?: string; required?: boolean; type?: string;
}) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <input type={type} className="input mt-8" value={value} onChange={(e) => onChange(e.target.value)} />
      {hint && <div className="field-hint mt-4">{hint}</div>}
    </div>
  );
}

// ─── Stepper (number inc/dec + direct type)
export function Stepper({
  value, onChange, min = 0, max = 999, suffix = '',
}: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; suffix?: string;
}) {
  // Local string state lets users type freely; commits on blur or Enter
  const [draft, setDraft] = useState(String(value));

  // Keep draft in sync when parent changes value (e.g. stepper buttons)
  useEffect(() => { setDraft(String(value)); }, [value]);

  const commit = (raw: string) => {
    const n = parseInt(raw, 10);
    if (!isNaN(n)) onChange(Math.min(max, Math.max(min, n)));
    else setDraft(String(value)); // revert if not a number
  };

  return (
    <div className="flex items-center gap-8" style={{ border: '1px solid var(--line)', borderRadius: 999, padding: '4px 4px 4px 14px', width: 'fit-content', background: 'white' }}>
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))}
        style={{ background: 'transparent', border: 0, width: 28, height: 28, borderRadius: 999, display: 'grid', placeItems: 'center' }}>
        <Icon name="minus" size={14} />
      </button>
      <input
        type="number"
        className="stepper-input"
        value={draft}
        min={min}
        max={max}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') commit((e.target as HTMLInputElement).value); }}
        style={{
          width: Math.max(28, draft.length * 9 + 10),
          textAlign: 'center',
          fontWeight: 700,
          border: 0,
          outline: 'none',
          background: 'transparent',
          fontSize: 'inherit',
          padding: 0,
          MozAppearance: 'textfield',
        } as React.CSSProperties}
      />
      {suffix && <span style={{ fontWeight: 700, marginLeft: -4 }}>{suffix}</span>}
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))}
        style={{ background: 'var(--primary)', color: 'white', border: 0, width: 28, height: 28, borderRadius: 999, display: 'grid', placeItems: 'center' }}>
        <Icon name="plus" size={14} />
      </button>
    </div>
  );
}

// ─── Stepper with label
export function StepperField({ label, value, onChange, required, min = 0, max = 999 }: {
  label: string; value: number; onChange: (v: number) => void; required?: boolean; min?: number; max?: number;
}) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <div className="mt-8"><Stepper value={value} onChange={onChange} min={min} max={max} /></div>
    </div>
  );
}

// ─── Size chip group
export function SizeChips({ options, multi = false, value, onChange }: {
  options: string[]; multi?: boolean; value: string | string[]; onChange: (v: string | string[]) => void;
}) {
  const isActive = (o: string) => multi ? (value as string[]).includes(o) : value === o;
  const toggle = (o: string) => {
    if (multi) {
      const arr = value as string[];
      onChange(isActive(o) ? arr.filter((v) => v !== o) : [...arr, o]);
    } else {
      onChange(o);
    }
  };
  return (
    <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
      {options.map((o) => (
        <button key={o} type="button" onClick={() => toggle(o)}
          className={`chip chip-selectable ${isActive(o) ? 'chip-selected' : ''}`}
          style={{ minWidth: 42, height: 42, borderRadius: 999, justifyContent: 'center' }}>
          {o}
        </button>
      ))}
    </div>
  );
}

// ─── Price line display
export function PriceLine({ items }: { items: [string, string][] }) {
  return (
    <div style={{ display: 'flex', gap: 24, padding: '14px 18px', background: 'var(--bg-2)', borderRadius: 14, flexWrap: 'wrap' }}>
      {items.map(([k, v]) => (
        <div key={k}>
          <div className="text-12 muted">{k}</div>
          <div className="fw-700 mt-4">{v}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Radio chip card
export function RadioChip({ selected, onClick, children }: {
  selected: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} style={{
      cursor: 'pointer',
      border: `1px solid ${selected ? 'var(--primary)' : 'var(--line)'}`,
      background: selected ? 'var(--primary-50)' : 'white',
      borderRadius: 14, padding: '12px 14px', textAlign: 'center', fontFamily: 'inherit',
    }}>
      {children}
    </button>
  );
}

// ─── Checkbox row
export function CheckRow({ checked, onChange, label, sub, price, icon, children }: {
  checked: boolean; onChange: (v: boolean) => void;
  label: string; sub?: string; price?: number; icon?: string; children?: React.ReactNode;
}) {
  return (
    <label className="flex gap-12 items-center" style={{
      cursor: 'pointer', padding: '14px 16px',
      border: `1px solid ${checked ? 'var(--primary)' : 'var(--line)'}`,
      background: checked ? 'var(--primary-50)' : 'white',
      borderRadius: 14,
    }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        style={{ accentColor: 'var(--primary)' }} />
      {icon && (
        <span style={{ display: 'grid', placeItems: 'center', width: 32, height: 32, borderRadius: 8, background: 'var(--primary-50)', color: 'var(--primary-700)' }}>
          <Icon name={icon} size={18} />
        </span>
      )}
      <div style={{ flex: 1 }}>
        <div className="fw-600 text-14">{label}</div>
        {sub && <div className="muted text-12 mt-4">{sub}</div>}
        {children}
      </div>
      {price !== undefined && <span className="fw-700">€{price}</span>}
    </label>
  );
}

// ─── Compact pick (checkbox-like button)
export function CompactPick({ label, selected, onClick }: {
  label: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
        border: `1px solid ${selected ? 'var(--primary)' : 'var(--line)'}`,
        background: selected ? 'var(--primary-50)' : 'white',
        borderRadius: 12, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
      <span style={{ width: 16, height: 16, border: `1.5px solid ${selected ? 'var(--primary)' : 'var(--line)'}`,
        background: selected ? 'var(--primary)' : 'white', borderRadius: 4, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        {selected && <Icon name="check" size={11} color="white" />}
      </span>
      <span className="text-14">{label}</span>
    </button>
  );
}

// ─── Toggle pair (e.g. Rent / Buy)
export function TogglePair({ value, onChange, options }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex gap-8" style={{ background: 'var(--bg-3)', padding: 4, borderRadius: 999, width: 'fit-content', maxWidth: '100%', flexWrap: 'wrap' }}>
      {options.map((o) => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)} className="btn btn-sm"
          style={{ background: value === o.value ? 'white' : 'transparent', color: 'var(--ink)',
            boxShadow: value === o.value ? '0 2px 8px rgba(0,0,0,.08)' : 'none',
            borderColor: 'transparent', borderRadius: 999 }}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ─── Fitting field (date + time)
export function FittingField({ label, value, onChange, required }: {
  label: string; value: { date: string; time: string };
  onChange: (v: { date: string; time: string }) => void; required?: boolean;
}) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <div className="flex gap-8 mt-8">
        <input type="date" className="input" value={value.date} onChange={(e) => onChange({ ...value, date: e.target.value })} />
        <input type="time" className="input" value={value.time} onChange={(e) => onChange({ ...value, time: e.target.value })} style={{ width: 110 }} />
      </div>
    </div>
  );
}

// ─── Size row (label + chips)
export function SizeRow({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div>
      <Label required>{label}</Label>
      <div className="mt-8"><SizeChips options={options} value={value} onChange={(v) => onChange(v as string)} /></div>
    </div>
  );
}

// ─── Upload field
export function UploadField({ label }: { label: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <label className="flex items-center justify-center mt-8" style={{
        border: '2px dashed var(--line)', borderRadius: 14, padding: '32px 16px', cursor: 'pointer',
        flexDirection: 'column', gap: 8, color: 'var(--muted)', background: 'var(--bg-2)',
      }}>
        <Icon name="upload" size={22} />
        <span className="text-14">Click to upload an image</span>
        <input type="file" style={{ display: 'none' }} />
      </label>
    </div>
  );
}
