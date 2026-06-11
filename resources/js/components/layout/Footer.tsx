import { Link } from '@inertiajs/react';
import Icon from '../shared/Icon';
import logoWhite from '../../assets/logo-white.svg';

function FooterCol({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: '.08em', textTransform: 'uppercase', color: 'white', marginBottom: 14 }}>
        {title}
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.to} style={{ fontSize: 14, color: 'rgba(255,255,255,.82)' }}>{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container-wide" style={{ padding: '52px 28px 32px' }}>
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 40 }}>
          {/* Brand */}
          <div>
            <img src={logoWhite} alt="WedBox" style={{ height: 40, width: 'auto' }} />
            <p style={{ color: 'rgba(255,255,255,.78)', marginTop: 16, fontSize: 14, maxWidth: 300, lineHeight: 1.6 }}>
              WedBox Ltd is incorporated in England, Wales and Cyprus.<br />Reg. No. 12345678
            </p>
            <div className="flex gap-12" style={{ marginTop: 24 }}>
              <a href="https://www.facebook.com/profile.php?id=61565211685376" target="_blank" rel="noopener noreferrer" style={{ width: 36, height: 36, borderRadius: 999, background: 'rgba(255,255,255,.18)', display: 'grid', placeItems: 'center' }}>
                <Icon name="facebook" size={16} color="white" />
              </a>
              <a href="https://instagram.com/wedbox.io?igsh=MWRubm142ZmNTJuNA%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" style={{ width: 36, height: 36, borderRadius: 999, background: 'rgba(255,255,255,.18)', display: 'grid', placeItems: 'center' }}>
                <Icon name="instagram" size={16} color="white" />
              </a>
            </div>
          </div>

          <FooterCol title="Destinations" links={[
            { label: 'Ayia Napa',  to: '/search?location=Ayia+Napa'  },
            { label: 'Limassol',   to: '/search?location=Limassol'   },
            { label: 'Paphos',     to: '/search?location=Paphos'     },
            { label: 'Larnaca',    to: '/search?location=Larnaca'    },
            { label: 'Nicosia',    to: '/search?location=Nicosia'    },
            { label: 'Protaras',   to: '/search?location=Protaras'   },
          ]} />

          <FooterCol title="Info" links={[
            { label: 'About Us',   to: '/about'   },
            { label: 'Vendors',    to: '/search'  },
            { label: 'FAQ',        to: '/faq'     },
            { label: 'Contact Us', to: '/contact' },
            { label: 'Legalities', to: '#'        },
          ]} />
        </div>

        <hr style={{ border: 0, borderTop: '1px solid rgba(255,255,255,.18)', margin: '40px 0 16px' }} />
        <div className="flex items-center justify-between" style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', flexWrap: 'wrap', gap: 8 }}>
          <span>© 2026 WedBox Limited and its affiliated companies. All rights reserved.</span>
          <span>Made with care in Cyprus 🇨🇾</span>
        </div>
      </div>
    </footer>
  );
}
