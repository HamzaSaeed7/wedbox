import { useState } from 'react';
import { router } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import Icon from './Icon';
import { CATEGORIES, CITIES } from '../../lib/data';
import { publicApi } from '../../lib/api';

interface SearchBarProps {
  pill?: boolean;
  dark?: boolean;
  big?: boolean;
}

function SearchField({
  icon, placeholder, value, onChange, dark,
  options,
}: {
  icon: string; placeholder: string; value: string;
  onChange: (v: string) => void; dark?: boolean;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="search-field" style={{
      flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '0 18px', minWidth: 0,
    }}>
      <Icon name={icon} size={18} color={dark ? 'rgba(255,255,255,.7)' : 'var(--muted)'} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          appearance: 'none', border: 0, background: 'transparent', outline: 'none',
          color: dark ? 'white' : value ? 'var(--ink)' : 'var(--muted)',
          fontSize: 14, fontWeight: 500, padding: '14px 4px', width: '100%', cursor: 'pointer',
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ color: 'var(--ink)' }}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

export default function SearchBar({ pill = true, dark = false, big = false }: SearchBarProps) {
  const [svc, setSvc] = useState('');
  const [loc, setLoc] = useState('');

  const { data: apiCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => publicApi.categories(),
    staleTime: 10 * 60 * 1000,
  });
  const { data: apiCities } = useQuery({
    queryKey: ['cities'],
    queryFn: () => publicApi.cities(),
    staleTime: 10 * 60 * 1000,
  });

  const categoryOptions = ((Array.isArray(apiCategories) && apiCategories.length > 0)
    ? apiCategories.map((c: { slug: string; name: string }) => ({ value: c.slug, label: c.name }))
    : CATEGORIES.map((c) => ({ value: c.slug, label: c.name }))
  ).sort((a, b) => a.label.localeCompare(b.label));

  const cityOptions = (Array.isArray(apiCities) && apiCities.length > 0)
    ? apiCities.map((c: { name: string }) => ({ value: c.name, label: c.name }))
    : CITIES.map((c) => ({ value: c.name, label: c.name }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.visit(`/search?category=${svc}&location=${loc}`);
      }}
      className="search-form"
      style={{
        background: dark ? 'rgba(255,255,255,.12)' : 'white',
        backdropFilter: 'blur(12px)',
        border: dark ? '1px solid rgba(255,255,255,.28)' : '1px solid var(--line)',
        borderRadius: pill ? 999 : 14,
        padding: big ? '8px' : '6px',
        boxShadow: 'none',
      }}
    >
      <SearchField
        icon="search" placeholder="Select Service" value={svc} onChange={setSvc}
        dark={dark} options={categoryOptions}
      />
      <div className="search-divider" style={{ background: dark ? 'rgba(255,255,255,.24)' : 'var(--line)' }} />
      <SearchField
        icon="location" placeholder="Location" value={loc} onChange={setLoc}
        dark={dark} options={cityOptions}
      />
      <button
        type="submit"
        className="btn btn-primary search-btn"
        style={{ borderRadius: pill ? 999 : 10, padding: '0 28px', height: 'auto', minHeight: big ? 56 : 48 }}
      >
        Search
      </button>
    </form>
  );
}
