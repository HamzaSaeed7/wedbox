import { Link, router } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import Icon from '../components/shared/Icon';
import ServiceCard from '../components/shared/ServiceCard';
import SearchBar from '../components/shared/SearchBar';
import { CATEGORIES, IMG } from '../lib/data';
import { servicesApi, publicApi } from '../lib/api';
import type { Service } from '../lib/types';
import PublicLayout from '../Layouts/PublicLayout';
import smartphoneMockup from '../../Images/smartphone-mockup-floating.png';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeService(s: any): Service {
  return {
    id: s.id,
    slug: s.category?.slug ?? '',
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

function HeroSplit() {
  return (
    <section style={{ position: 'relative', width: '100%', height: '100vh', marginTop: -72, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <video autoPlay loop muted playsInline
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}>
        <source src="https://wedbox-app-production-bucket.s3.ap-south-1.amazonaws.com/videos/hero-wedding.mp4" type="video/mp4" />
      </video>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.45)' }} />
      <div style={{ position: 'relative', textAlign: 'center', padding: '80px 24px 100px', maxWidth: 760, width: '100%' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,.9)', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', marginBottom: 24 }}>
          ALL IN ONE PACKAGES
        </div>
        <h1 style={{ color: 'white', fontSize: 'clamp(28px, 5.5vw, 64px)', fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.02em', margin: 0 }}>
          Plan your wedding in one click.
        </h1>
        <p style={{ color: 'rgba(255,255,255,.82)', fontSize: 17, marginTop: 24, lineHeight: 1.6 }}>
          The best venues, vendors and packages in Cyprus - all in one place, with the total cost upfront.
        </p>
        <div style={{ marginTop: 40, maxWidth: 680, marginInline: 'auto' }}>
          <SearchBar big dark />
        </div>
      </div>
    </section>
  );
}

function CategoriesStrip() {
  return (
    <section className="container-wide" style={{ padding: '40px 28px' }}>
      <div className="flex items-center justify-between mb-20">
        <h2 style={{ fontSize: 28 }}>Make your dream come true</h2>
        <Link href="/search" className="muted text-14 fw-600 flex items-center gap-4">
          Browse all <Icon name="arrowRight" size={14} />
        </Link>
      </div>
      <div className="grid r-grid-cat" style={{ gap: 14 }}>
        {CATEGORIES.slice(0, 9).map((c) => (
          <button key={c.slug} onClick={() => router.visit(`/search?category=${c.slug}`)}
            style={{ background: 'white', border: '1px solid var(--line)', borderRadius: 16, padding: '18px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, cursor: 'pointer', transition: 'all .15s ease' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#4DC9C9'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--line)'; (e.currentTarget as HTMLButtonElement).style.transform = 'none'; }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(77,201,201,.094)', color: '#4DC9C9', display: 'grid', placeItems: 'center' }}>
              <Icon name={c.icon} size={22} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, textAlign: 'center' }}>{c.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function FeaturedServices() {
  const { data: apiData, isLoading } = useQuery({
    queryKey: ['featured-services'],
    queryFn: () => servicesApi.featured(),
    staleTime: 60_000,
  });

  const featured: Service[] = Array.isArray(apiData) ? apiData.map(normalizeService).slice(0, 6) : [];

  if (isLoading) return (
    <section className="container-wide" style={{ padding: '48px 28px 64px' }}>
      <div className="flex items-center justify-between mb-20">
        <div><h2 style={{ fontSize: 32 }}>Featured this season</h2></div>
      </div>
      <div className="grid r-grid-3" style={{ gap: 24 }}>
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
    </section>
  );

  return (
    <section className="container-wide" style={{ padding: '48px 28px 64px' }}>
      <div className="flex items-center justify-between mb-20">
        <div>
          <h2 style={{ fontSize: 32 }}>Featured this season</h2>
          <p className="muted mt-8">Hand-picked vendors couples are loving right now.</p>
        </div>
        <Link href="/search" className="btn btn-ghost hide-mobile">View all</Link>
      </div>
      {featured.length === 0
        ? <p className="muted">No featured services yet. Check back soon.</p>
        : <div className="grid r-grid-3" style={{ gap: 24 }}>
            {featured.map((s) => <ServiceCard key={s.id} service={s} />)}
          </div>
      }
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: '01', title: 'Discover & Filter', body: 'Browse top Cyprus wedding professionals. Filter instantly by city, style, and availability to find the perfect match for your date.' },
    { n: '02', title: 'Build Your Perfect Day', body: 'Select your favorite venue, photographer, florist, and more. Choose from their ready-to-book packages and add-ons to design your unforgettable day.' },
    { n: '03', title: 'Book Instantly for Free', body: 'Lock in your wedding date with one click. No credit cards required here — your booking goes straight to the vendors, and you pay them directly later.' },
  ];
  return (
    <section className="container-wide" style={{ padding: '64px 28px', background: 'var(--bg-2)', borderRadius: 32 }}>
      <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--primary-700)', marginBottom: 12 }}>How WedBox Works</div>
        <h2>Three steps to your dream wedding</h2>
        <p className="mt-12" style={{ fontSize: 16, color: 'var(--muted)' }}>No endless phone calls. No deposit fees on our platform. Just one place to secure your entire wedding team.</p>
      </div>
      <div className="grid r-grid-3 mt-32" style={{ gap: 20 }}>
        {steps.map((s) => (
          <div key={s.n} className="card card-pad" style={{ borderRadius: 20, background: 'white' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-700)', letterSpacing: '.08em' }}>{s.n}</div>
            <h3 className="mt-12" style={{ fontSize: 22 }}>{s.title}</h3>
            <p className="mt-12 muted">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function DestinationsGrid() {
  const items = [
    { name: 'Ayia Napa', img: IMG('1507525428034-b723cf961d3e', 800, 600), tag: '142 vendors' },
    { name: 'Paphos',    img: IMG('1519225421980-715cb0215aed', 800, 600), tag: '98 vendors' },
    { name: 'Limassol',  img: IMG('1505944270255-72b8c68c6a70', 800, 600), tag: '124 vendors' },
    { name: 'Protaras',  img: IMG('1566073771259-6a8506099945', 800, 600), tag: '67 vendors' },
  ];
  return (
    <section className="container-wide" style={{ padding: '72px 28px' }}>
      <div className="flex items-center justify-between mb-24">
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--primary-700)' }}>Destinations</div>
          <h2 className="mt-8" style={{ fontSize: 32 }}>Built for Cyprus weddings</h2>
        </div>
        <Link href="/search" className="muted fw-600 hide-mobile">All locations →</Link>
      </div>
      <div className="grid r-grid-destinations" style={{ gap: 16 }}>
        {items.map((item, i) => (
          <Link key={item.name} href={`/search?location=${item.name}`}
            style={{
              position: 'relative', borderRadius: 20, overflow: 'hidden', minHeight: 200,
              gridRow: i === 0 ? 'span 2' : undefined,
              gridColumn: i === 3 ? 'span 2' : undefined,
            }}>
            <img src={item.img} alt={item.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,.6))' }} />
            <div style={{ position: 'absolute', left: 20, bottom: 18, color: 'white' }}>
              <div style={{ fontSize: i === 0 ? 28 : 22, fontWeight: 700 }}>{item.name}</div>
              <div style={{ fontSize: 13, opacity: .9 }}>{item.tag}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const { data: apiTestimonials } = useQuery({
    queryKey: ['testimonials'],
    queryFn: () => publicApi.testimonials(),
    staleTime: 300_000,
  });

  const items = (Array.isArray(apiTestimonials) && apiTestimonials.length > 0)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? apiTestimonials.slice(0, 3).map((t: any) => ({
        name: t.user_name ?? t.name ?? '',
        location: t.location ?? '',
        avatar: t.photo_url ?? t.avatar_url ?? t.avatar ?? '',
        text: t.text ?? t.body ?? '',
      }))
    : [];

  if (items.length === 0) return null;

  return (
    <section style={{ background: 'var(--primary-50)', padding: '80px 0' }}>
      <div className="container-wide" style={{ padding: '0 28px' }}>
        <div className="grid r-grid-testimonials" style={{ gap: 20, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--primary-700)' }}>Customer testimonial</div>
            <h2 className="mt-12">Our valuable couples</h2>
            <p className="muted mt-12">We measure ourselves by how relaxed our couples are on the day.</p>
            <Link href="#" className="btn btn-primary mt-20">View more</Link>
          </div>
          {items.map((t, i) => (
            <div key={i} className="card card-pad" style={{ background: 'white', borderRadius: 18 }}>
              <div style={{ fontSize: 36, fontFamily: 'serif', color: 'var(--primary)', lineHeight: 0.5, marginBottom: 8 }}>"</div>
              <p style={{ fontSize: 14, lineHeight: 1.55 }}>{t.text}</p>
              <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: '16px 0' }} />
              <div className="flex items-center gap-12">
                {t.avatar
                  ? <img src={t.avatar} alt={t.name} style={{ width: 44, height: 44, borderRadius: 999, objectFit: 'cover' }} />
                  : <div style={{ width: 44, height: 44, borderRadius: 999, background: 'var(--primary-50)', color: 'var(--primary-700)', display: 'grid', placeItems: 'center', fontWeight: 700 }}>{t.name[0]}</div>
                }
                <div>
                  <div className="fw-700 text-14">{t.name}</div>
                  <div className="muted text-12">{t.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AppCTA() {
  return (
    <section className="container-wide" style={{ padding: '80px 28px' }}>
      <div className="card grid r-grid-halves" style={{ overflow: 'hidden', background: 'var(--bg-2)', border: 0, borderRadius: 32 }}>
        <div style={{ padding: 'clamp(32px, 5vw, 60px)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--primary-700)' }}>Mobile app · Coming soon</div>
          <h2 className="mt-16">Plan your wedding without stress.</h2>
          <p className="muted mt-16" style={{ maxWidth: 460 }}>
            Choose your vendors, build your day and see the total cost — anytime, from your phone.
          </p>
          <div className="flex gap-12 mt-24" style={{ flexWrap: 'wrap' }}>
            <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'var(--ink)', color: 'white', padding: '10px 20px', borderRadius: 12, textDecoration: 'none' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.37 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <div>
                <div style={{ fontSize: 10, opacity: .8 }}>Download on the</div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>App Store</div>
              </div>
            </a>
            <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'var(--ink)', color: 'white', padding: '10px 20px', borderRadius: 12, textDecoration: 'none' }}>
              <svg width="22" height="22" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285F4" d="M4 4.4 L4 24 L20 24 Z"/>
                <path fill="#EA4335" d="M4 4.4 L44 24 L20 24 Z"/>
                <path fill="#34A853" d="M4 43.6 L4 24 L20 24 Z"/>
                <path fill="#FBBC04" d="M4 43.6 L20 24 L44 24 Z"/>
              </svg>
              <div>
                <div style={{ fontSize: 10, opacity: .8 }}>Get it on</div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>Google Play</div>
              </div>
            </a>
          </div>
        </div>
        <div className="hide-mobile" style={{ position: 'relative', background: '#fafbfb', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden' }}>
          <img src={smartphoneMockup} alt="" style={{ width: '90%', maxWidth: 480, height: 'auto', display: 'block' }} />
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <PublicLayout>
      <div className="fade-up">
        <HeroSplit />
        <CategoriesStrip />
        <FeaturedServices />
        <HowItWorks />
        <DestinationsGrid />
        <Testimonials />
        <AppCTA />
      </div>
    </PublicLayout>
  );
}
