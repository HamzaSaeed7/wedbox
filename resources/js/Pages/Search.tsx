import { useState, useMemo, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import Icon from '../components/shared/Icon';
import Stars from '../components/shared/Stars';
import ServiceCard from '../components/shared/ServiceCard';
import SearchBar from '../components/shared/SearchBar';
import { CATEGORIES } from '../lib/data';
import { servicesApi, publicApi } from '../lib/api';
import type { Service } from '../lib/types';
import PublicLayout from '../Layouts/PublicLayout';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeService(s: any): Service {
  return {
    id: s.id,
    slug: s.category?.slug ?? s.slug ?? '',
    vendor: s.vendor?.vendorProfile?.business_name ?? s.vendor?.name ?? '',
    title: s.title,
    location: s.location ?? '',
    images: Array.isArray(s.images)
      ? s.images.map((img: { url: string } | string) => typeof img === 'string' ? img : img.url).filter(Boolean)
      : [],
    minimum_price: Number(s.minimum_price) || 0,
    rating: Number(s.rating) || 0,
    reviews: s.review_count ?? 0,
    featured: s.is_featured ?? false,
    description: s.description ?? '',
  };
}

const FILTER_INITIAL_COUNT = 5;

function FilterPanel({
  category, setCategory, priceMin, setPriceMin, priceMax, setPriceMax, ratingMin, setRatingMin,
}: {
  category: string; setCategory: (v: string) => void;
  priceMin: number; setPriceMin: (v: number) => void;
  priceMax: number; setPriceMax: (v: number) => void;
  ratingMin: number; setRatingMin: (v: number) => void;
}) {
  const [catExpanded, setCatExpanded] = useState(false);

  const { data: apiCats } = useQuery({
    queryKey: ['categories'],
    queryFn: () => publicApi.categories(),
    staleTime: 10 * 60 * 1000,
  });

  const catList: { slug: string; name: string }[] =
    Array.isArray(apiCats) && apiCats.length > 0 ? apiCats : CATEGORIES;

  const allCats = [{ slug: '', name: 'All categories' }, ...catList];
  const visibleCats = catExpanded ? allCats : allCats.slice(0, FILTER_INITIAL_COUNT + 1); // +1 for "All categories"

  return (
    <div className="card card-pad" style={{ position: 'sticky', top: 96 }}>
      <div className="fw-700 text-14">Filters</div>
      <div className="mt-20">
        <div className="field-label mb-8">Category</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {visibleCats.map((c) => (
            <label key={c.slug} className="flex items-center gap-8" style={{ padding: '6px 0', cursor: 'pointer' }}>
              <input type="radio" name="cat" checked={category === c.slug} onChange={() => setCategory(c.slug)} style={{ accentColor: 'var(--primary)' }} />
              <span className="text-14">{c.name}</span>
            </label>
          ))}
          <button
            type="button"
            onClick={() => setCatExpanded((e) => !e)}
            style={{ alignSelf: 'flex-start', marginTop: 4, padding: '4px 0', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: 13, fontWeight: 600 }}>
            {catExpanded ? '↑ Show less' : `+ ${allCats.length - (FILTER_INITIAL_COUNT + 1)} more categories`}
          </button>
        </div>
      </div>
      <div className="mt-20">
        <div className="field-label">Price range</div>
        <div className="flex gap-8 items-center mt-8">
          <input type="number" className="input" placeholder="Min" value={priceMin} onChange={(e) => setPriceMin(+e.target.value)} />
          <span>—</span>
          <input type="number" className="input" placeholder="Max" value={priceMax} onChange={(e) => setPriceMax(+e.target.value)} />
        </div>
      </div>
      <div className="mt-20">
        <div className="field-label mb-8">Minimum rating</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0, 3, 4, 4.5].map((r) => (
            <button key={r} type="button" onClick={() => setRatingMin(r)}
              className={`chip chip-selectable ${ratingMin === r ? 'chip-selected' : ''}`}>
              {r === 0 ? 'Any' : `${r}+★`}
            </button>
          ))}
        </div>
      </div>
      <button className="btn btn-ghost btn-block mt-24"
        onClick={() => { setCategory(''); setPriceMin(0); setPriceMax(10000); setRatingMin(0); }}>
        Reset filters
      </button>
    </div>
  );
}

function ListRow({ service }: { service: Service }) {
  const cat = CATEGORIES.find((c) => c.slug === service.slug);
  return (
    <Link href={`/service/${service.id}`} className="card search-list-row flex" style={{ overflow: 'hidden' }}>
      <img src={service.images[0]} alt="" style={{ width: 240, height: 180, objectFit: 'cover', flexShrink: 0 }} />
      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
        <div>
          <div className="flex items-center gap-8">
            <span className="chip chip-soft">{cat?.name}</span>
            <span className="text-13 muted">{service.location}</span>
          </div>
          <h3 className="mt-8" style={{ fontSize: 20 }}>{service.title}</h3>
          <p className="muted mt-8 text-14" style={{ maxWidth: 540 }}>{service.description}</p>
        </div>
        <div className="flex items-center justify-between mt-12">
          <div className="flex items-center gap-8">
            <Stars value={service.rating} />
            <span className="text-13 fw-600">{service.rating}</span>
            <span className="muted text-13">({service.reviews})</span>
          </div>
          <div className="fw-700">from €{service.minimum_price.toLocaleString()}</div>
        </div>
      </div>
    </Link>
  );
}

function Pagination({ current, last, onChange }: { current: number; last: number; onChange: (p: number) => void }) {
  const pages: (number | '…')[] = [];
  if (last <= 7) {
    for (let i = 1; i <= last; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push('…');
    for (let i = Math.max(2, current - 1); i <= Math.min(last - 1, current + 1); i++) pages.push(i);
    if (current < last - 2) pages.push('…');
    pages.push(last);
  }

  const btn = (label: React.ReactNode, target: number | null, active = false, disabled = false) => (
    <button
      key={String(label)}
      type="button"
      disabled={disabled}
      onClick={() => target !== null && onChange(target)}
      style={{
        minWidth: 38, height: 38, borderRadius: 10, border: active ? '2px solid var(--primary)' : '1px solid var(--line)',
        background: active ? 'var(--primary)' : 'white', color: active ? 'white' : disabled ? 'var(--muted)' : 'var(--ink)',
        fontWeight: active ? 700 : 400, fontSize: 14, cursor: disabled ? 'default' : 'pointer',
        display: 'grid', placeItems: 'center', padding: '0 10px', transition: 'all .15s',
      }}>
      {label}
    </button>
  );

  return (
    <div className="flex items-center justify-center gap-6 mt-32" style={{ flexWrap: 'wrap' }}>
      {btn('←', current - 1, false, current === 1)}
      {pages.map((p, i) =>
        p === '…'
          ? <span key={`ellipsis-${i}`} style={{ padding: '0 4px', color: 'var(--muted)', lineHeight: '38px' }}>…</span>
          : btn(p, p as number, p === current)
      )}
      {btn('→', current + 1, false, current === last)}
    </div>
  );
}

interface SearchProps {
  initialCategory?: string;
  initialLocation?: string;
}

export default function Search({ initialCategory = '', initialLocation = '' }: SearchProps) {
  // Props can also come from Inertia page props
  const pageProps = usePage().props as SearchProps;
  const initCat = initialCategory || pageProps.initialCategory || '';
  const initLoc = initialLocation || pageProps.initialLocation || '';

  const [category, setCategory] = useState(initCat);
  const [location] = useState(initLoc);
  const [sort, setSort] = useState('popular');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(10000);
  const [ratingMin, setRatingMin] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  // Re-sync when Inertia navigates with new props
  useEffect(() => {
    setCategory(pageProps.initialCategory || '');
  }, [pageProps.initialCategory]);

  // Reset to page 1 whenever filters/sort change
  useEffect(() => { setPage(1); }, [category, location, priceMin, priceMax, ratingMin, sort]);

  const sortParams = sort === 'priceAsc'
    ? { sort: 'minimum_price', sort_dir: 'asc' }
    : sort === 'priceDesc'
    ? { sort: 'minimum_price', sort_dir: 'desc' }
    : sort === 'rating'
    ? { sort: 'rating' }
    : { sort: 'created_at' };

  const { data: apiResult, isLoading } = useQuery({
    queryKey: ['services', category, location, priceMin, priceMax, ratingMin, sort, page],
    queryFn: () => servicesApi.list({
      ...(category && { category }),
      ...(location && { location }),
      ...(priceMin > 0 && { min_price: priceMin }),
      ...(priceMax < 10000 && { max_price: priceMax }),
      ...(ratingMin > 0 && { rating_min: ratingMin }),
      ...sortParams,
      page,
    }),
    staleTime: 30_000,
  });

  const results: Service[] = useMemo(
    () => (apiResult?.data ?? []).map(normalizeService),
    [apiResult],
  );

  const totalResults: number = apiResult?.total ?? results.length;
  const lastPage: number     = apiResult?.last_page ?? 1;
  const currentPage: number  = apiResult?.current_page ?? page;

  const cat = CATEGORIES.find((c) => c.slug === category);

  const activeFilterCount = (category ? 1 : 0) + (priceMin > 0 ? 1 : 0) + (priceMax < 10000 ? 1 : 0) + (ratingMin > 0 ? 1 : 0);

  return (
    <PublicLayout>
      <div className="container-wide fade-up" style={{ padding: '24px 0 64px' }}>
        <div style={{ padding: '0 28px' }}>
          <SearchBar />
        </div>
        <div className="flex items-center justify-between mt-24 mb-16" style={{ flexWrap: 'wrap', gap: 12, padding: '0 28px' }}>
          <div>
            <h1 style={{ fontSize: 28 }}>
              {cat ? cat.name : 'All vendors'}
              {location && <span className="muted" style={{ fontWeight: 400 }}> · {location}</span>}
            </h1>
            <div className="muted mt-4">{isLoading ? 'Searching…' : `${totalResults} results`}</div>
          </div>
          <div className="flex items-center gap-12" style={{ flexWrap: 'wrap' }}>
            {/* Mobile filters toggle */}
            <button
              className="search-filter-toggle btn btn-ghost"
              onClick={() => setFiltersOpen((o) => !o)}
              style={{ alignItems: 'center', gap: 6, fontSize: 13 }}>
              <Icon name="filter" size={14} />
              Filters
              {activeFilterCount > 0 && (
                <span style={{ background: 'var(--primary)', color: 'white', borderRadius: 999, fontSize: 11, fontWeight: 700, padding: '1px 6px', marginLeft: 2 }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
            <select className="select" style={{ width: 'auto', minWidth: 0, fontSize: 13 }} value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="popular">Most popular</option>
              <option value="priceAsc">Price: low → high</option>
              <option value="priceDesc">Price: high → low</option>
              <option value="rating">Highest rated</option>
            </select>
            <div className="flex" style={{ background: 'var(--bg-3)', padding: 3, borderRadius: 999 }}>
              <button onClick={() => setView('grid')} className="btn btn-sm" style={{ background: view === 'grid' ? 'white' : 'transparent', boxShadow: view === 'grid' ? '0 1px 4px rgba(0,0,0,.08)' : 'none', color: 'var(--ink)', borderRadius: 999, padding: '6px 10px' }}>
                <Icon name="grid" size={14} />
              </button>
              <button onClick={() => setView('list')} className="btn btn-sm" style={{ background: view === 'list' ? 'white' : 'transparent', boxShadow: view === 'list' ? '0 1px 4px rgba(0,0,0,.08)' : 'none', color: 'var(--ink)', borderRadius: 999, padding: '6px 10px' }}>
                <Icon name="list" size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="search-layout" style={{ padding: '0 28px' }}>
          <aside className={`search-filter-aside${filtersOpen ? ' open' : ''}`}>
            <FilterPanel category={category} setCategory={(v) => { setCategory(v); setFiltersOpen(false); }}
              priceMin={priceMin} setPriceMin={setPriceMin}
              priceMax={priceMax} setPriceMax={setPriceMax}
              ratingMin={ratingMin} setRatingMin={setRatingMin} />
          </aside>
          <div>
            {isLoading ? (
              <div className="search-cards-grid">
                {[1,2,3,4,5,6].map((i) => (
                  <div key={i} className="card" style={{ borderRadius: 18, overflow: 'hidden' }}>
                    <div style={{ width: '100%', aspectRatio: '4/3', background: 'linear-gradient(90deg,var(--bg-3) 25%,var(--bg-2) 50%,var(--bg-3) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
                    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ height: 14, width: '70%', borderRadius: 6, background: 'linear-gradient(90deg,var(--bg-3) 25%,var(--bg-2) 50%,var(--bg-3) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
                      <div style={{ height: 12, width: '40%', borderRadius: 6, background: 'linear-gradient(90deg,var(--bg-3) 25%,var(--bg-2) 50%,var(--bg-3) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : view === 'grid' ? (
              <div className="search-cards-grid">
                {results.map((s) => <ServiceCard key={s.id} service={s} />)}
                {results.length === 0 && <div className="muted">No matches found — try clearing some filters.</div>}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {results.map((s) => <ListRow key={s.id} service={s} />)}
                {results.length === 0 && <div className="muted">No matches found — try clearing some filters.</div>}
              </div>
            )}
            {!isLoading && lastPage > 1 && (
              <Pagination current={currentPage} last={lastPage} onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
