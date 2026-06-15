import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import Icon from '../shared/Icon';
import Logo from '../shared/Logo';
import { useStore, useAuthUser } from '../../store';
import { cartApi } from '../../lib/api';

function UserDropdown({ iconColor }: { iconColor: string }) {
  const user = useAuthUser();
  const { logout } = useStore();
  const [open, setOpen] = useState(false);

  const dashboardLink = user?.role === 'vendor'
    ? '/dashboard/vendor'
    : user?.role === 'admin'
    ? '/dashboard/admin'
    : '/dashboard/buyer';

  const displayName = user?.profile?.first_name ?? user?.name?.split(' ')[0] ?? 'Account';

  return (
    <div style={{ position: 'relative' }} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false); }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-8 hide-tablet"
        style={{ background: 'transparent', border: 0, cursor: 'pointer', fontSize: 14, fontWeight: 600, color: iconColor, padding: '6px 4px' }}
      >
        <Icon name="user" size={18} color={iconColor} /> {user ? displayName : 'Account'}
        <Icon name={open ? 'minus' : 'plus'} size={12} color={iconColor} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          background: 'white', borderRadius: 14, border: '1px solid var(--line)',
          boxShadow: '0 8px 32px rgba(0,0,0,.12)', minWidth: 220, zIndex: 200, overflow: 'hidden',
        }}>
          {!user ? (
            <Link href="/auth" onClick={() => setOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', fontSize: 14, color: 'var(--ink)', fontWeight: 500 }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-2)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}>
              <Icon name="user" size={16} color="var(--primary)" /> Login / Sign up
            </Link>
          ) : (
            <>
              <Link href={dashboardLink} onClick={() => setOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', fontSize: 14, color: 'var(--ink)', fontWeight: 500, borderBottom: '1px solid var(--line)' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-2)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}>
                <Icon name="bookings" size={16} color="var(--primary)" /> My Dashboard
              </Link>
              <button onClick={() => { setOpen(false); logout(); }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', fontSize: 14, color: '#E11D48', fontWeight: 500, width: '100%', background: 'transparent', border: 0, cursor: 'pointer', textAlign: 'left' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-2)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}>
                <Icon name="logout" size={16} color="#E11D48" /> Sign out
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Badge({ n, primary }: { n: number; primary?: boolean }) {
  return (
    <span style={{
      position: 'absolute', top: 2, right: 0,
      background: primary ? 'var(--primary)' : '#E11D48',
      color: 'white', borderRadius: 999, minWidth: 18, height: 18, padding: '0 5px',
      fontSize: 11, fontWeight: 700, display: 'grid', placeItems: 'center',
    }}>
      {n}
    </span>
  );
}

const NAV_LINKS = [
  { to: '/search',  label: 'Discover' },
  { to: '/blog',    label: 'Blogs'    },
  { to: '/about',   label: 'About'    },
  { to: '/contact', label: 'Contact'  },
];

const HERO_ROUTES = new Set(['/', '/about']);

export default function Header() {
  const { cart, cartCount, favorites, setCartOpen, logout } = useStore();
  const user = useAuthUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { url } = usePage();
  // Get just the pathname from the full URL
  const pathname = url.split('?')[0];

  // Live cart count from API (authenticated users)
  const { data: apiCartData } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.get(),
    enabled: !!user,
    staleTime: 30_000,
  });
  const apiCartCount = user && Array.isArray(apiCartData) ? apiCartData.length : 0;
  const displayCartCount = user ? apiCartCount : (cartCount || cart.length);

  const isHeroPage = HERO_ROUTES.has(pathname);
  const transparent = isHeroPage && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  const iconColor = transparent ? 'white' : 'var(--ink)';

  return (
    <>
      <header className={`site-header${!transparent ? ' header-scrolled' : ''}`}>
        <div className="container-wide flex items-center justify-between" style={{ height: 72 }}>
          <Link href="/" style={{ display: 'flex' }} onClick={() => setMobileOpen(false)}>
            <Logo white={transparent} />
          </Link>

          <nav className="site-nav">
            {NAV_LINKS.map((l) => (
              <Link key={l.to} href={l.to} style={{ color: transparent ? 'rgba(255,255,255,.92)' : 'var(--ink-2)' }}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-12">
            <UserDropdown iconColor={iconColor} />
            <Link href="/dashboard/buyer/favorites" style={{ position: 'relative', padding: 8, color: iconColor }}>
              <Icon name="heart" size={20} color={iconColor} />
              {favorites.size > 0 && <Badge n={favorites.size} />}
            </Link>
            <button onClick={() => setCartOpen(true)}
              style={{ position: 'relative', padding: 8, background: transparent ? 'rgba(255,255,255,.18)' : 'var(--primary)', border: 0, borderRadius: 999, cursor: 'pointer' }}>
              <Icon name="cart" size={20} color="white" />
              {displayCartCount > 0 && <Badge n={displayCartCount} primary />}
            </button>
            <button className="mob-menu-btn" onClick={() => setMobileOpen((o) => !o)} aria-label="Menu"
              style={{ color: iconColor }}>
              <Icon name={mobileOpen ? 'close' : 'menu'} size={22} color={iconColor} />
            </button>
          </div>
        </div>
      </header>

      <nav className={`mob-nav ${mobileOpen ? 'open' : ''}`}>
        {NAV_LINKS.map((l) => (
          <Link key={l.to} href={l.to} onClick={() => setMobileOpen(false)}>{l.label}</Link>
        ))}
        <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: '8px 0' }} />
        {!user ? (
          <Link href="/auth" onClick={() => setMobileOpen(false)}
            style={{ padding: '14px 16px', borderRadius: 12, fontSize: 15, fontWeight: 500, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon name="user" size={18} color="var(--primary)" /> Login / Sign up
          </Link>
        ) : (
          <>
            <Link href={user.role === 'vendor' ? '/dashboard/vendor' : '/dashboard/buyer'} onClick={() => setMobileOpen(false)}
              style={{ padding: '14px 16px', borderRadius: 12, fontSize: 15, fontWeight: 500, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <Icon name="bookings" size={18} color="var(--primary)" /> My Dashboard
            </Link>
            <button onClick={() => { setMobileOpen(false); logout(); }}
              style={{ padding: '14px 16px', borderRadius: 12, fontSize: 15, fontWeight: 500, color: '#E11D48', display: 'flex', alignItems: 'center', gap: 12, width: '100%', background: 'transparent', border: 0, cursor: 'pointer', textAlign: 'left' }}>
              <Icon name="logout" size={18} color="#E11D48" /> Sign out
            </button>
          </>
        )}
      </nav>
    </>
  );
}
