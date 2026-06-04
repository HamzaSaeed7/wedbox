import { Link } from '@inertiajs/react';
import Icon from '../components/shared/Icon';
import PublicLayout from '../Layouts/PublicLayout';

import about1 from '../assets/about1.png';
import about3 from '../assets/about3.png';
import about4 from '../assets/about4.png';

const OFFERS = [
  { icon: 'hotel',    title: 'Hotel Bookings',                  desc: 'Find accommodations for you and your guests to relax and enjoy the celebrations.' },
  { icon: 'dress',    title: 'Attire',                          desc: 'Bridal dresses, bridesmaids outfits, flower girl dresses, groom suits, and best man attire — all in one place.' },
  { icon: 'yacht',    title: 'Yacht Hire',                      desc: 'Celebrate in style with an unforgettable yacht experience on the Mediterranean.' },
  { icon: 'venue',    title: 'Venues',                          desc: 'Explore breathtaking locations across Cyprus, from sandy beaches to elegant banquet halls.' },
  { icon: 'glass',    title: 'Bachelor & Bachelorette Parties', desc: 'Plan the ultimate pre-wedding celebration for the bride and groom.' },
  { icon: 'music',    title: 'Music & Entertainment',           desc: 'Live bands, DJs, and other entertainment options to keep the party alive.' },
  { icon: 'catering', title: 'Catering',                        desc: 'Choose from diverse menus tailored to your tastes.' },
  { icon: 'camera',   title: 'Photographers',                   desc: 'Capture every magical moment with experienced wedding photographers.' },
  { icon: 'makeup',   title: 'Beauty Services',                 desc: 'Professional makeup and hairstyling to make you look your best on your special day.' },
  { icon: 'florist',  title: 'Décor',                           desc: 'Stunning floral arrangements and decorations to set the mood.' },
  { icon: 'car',      title: 'Car Hire',                        desc: 'Luxurious vehicles to ensure a stylish arrival for the bride, groom, and guests.' },
  { icon: 'card',     title: 'Wedding Stationery & Website',    desc: 'Elegant invites and a custom website to share details and collect RSVPs.' },
];

export default function About() {
  return (
    <PublicLayout>
      <div>
        <section style={{ position: 'relative', width: '100%', height: '100vh', marginTop: -72, overflow: 'hidden' }}>
          <img src={about1} alt="About WedBox" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.12)' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
            <div className="container-wide" style={{ width: '100%', padding: '0 28px', pointerEvents: 'none' }}>
              <div style={{ background: 'rgba(77,201,201,0.42)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', borderRadius: 20, border: '1px solid rgba(255,255,255,.22)', padding: '44px 48px', maxWidth: 560, color: 'white', pointerEvents: 'auto' }}>
                <h2 style={{ color: 'white', fontSize: 34, fontWeight: 700, marginBottom: 20 }}>About Us</h2>
                <p style={{ fontSize: 15, lineHeight: 1.75, color: 'rgba(255,255,255,.95)', marginBottom: 16 }}>
                  Welcome to WedBox, your ultimate destination for planning and organizing your dream wedding in sunny Cyprus!
                </p>
                <p style={{ fontSize: 15, lineHeight: 1.75, color: 'rgba(255,255,255,.95)' }}>
                  At WedBox, we understand that your wedding day is one of the most cherished moments of your life. That's why we've created a one-stop platform to make your wedding planning experience seamless, stress-free, and unforgettable.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: '80px 28px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 32 }}>Who We Are</h2>
          <p className="muted mt-16" style={{ maxWidth: 560, marginInline: 'auto', fontSize: 15, lineHeight: 1.7 }}>
            Founded in 2024, WedBox was born out of a passion for delivering exceptional wedding experiences. Our mission is simple: to provide couples with an all-in-one solution for planning their perfect day.
          </p>
        </section>

        <section style={{ background: '#F7F8F8', padding: '72px 28px' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 style={{ fontSize: 32 }}>What We Offer</h2>
              <p className="muted mt-12" style={{ maxWidth: 560, marginInline: 'auto', fontSize: 15 }}>From the grand essentials to the smallest details, WedBox provides everything you need for your special day:</p>
            </div>
            <div className="grid r-grid-4" style={{ gap: 28 }}>
              {OFFERS.map((o) => (
                <div key={o.title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 10, background: 'white', border: '1px solid var(--line)', display: 'grid', placeItems: 'center' }}>
                    <Icon name={o.icon} size={20} color="var(--ink-2)" />
                  </div>
                  <div>
                    <div className="fw-700 text-14">{o.title}</div>
                    <div className="muted text-12 mt-4" style={{ lineHeight: 1.55 }}>{o.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '80px 28px' }}>
          <div className="container">
            <div className="grid r-grid-halves" style={{ gap: 60, alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: 30 }}>Why Choose WedBox?</h2>
                <div className="mt-24" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {[
                    { title: 'All-In-One Platform', desc: 'Say goodbye to the stress of juggling multiple vendors. With WedBox, everything you need is just a click away.' },
                    { title: 'Transparency in Costs', desc: "No surprises or hidden fees! With our platform, you'll know the total cost of your wedding upfront." },
                    { title: 'Cyprus Expertise', desc: "Our team has an in-depth understanding of Cyprus' unique charm, ensuring your wedding is nothing short of magical." },
                    { title: 'Tailored to You', desc: 'Every wedding is unique, and we work closely with you to ensure your special day reflects your personality and love story.' },
                  ].map((pt) => (
                    <div key={pt.title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 18, lineHeight: 1 }}>·</span>
                      <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--ink-2)' }}><strong>{pt.title}:</strong> {pt.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ borderRadius: 16, overflow: 'hidden' }}>
                <img src={about3} alt="Why WedBox" style={{ width: '100%', height: 420, objectFit: 'cover', display: 'block' }} />
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: '0 28px 80px' }}>
          <div className="container">
            <div className="grid r-grid-halves" style={{ gap: 60, alignItems: 'center' }}>
              <div style={{ borderRadius: 16, overflow: 'hidden' }}>
                <img src={about4} alt="Dream Wedding" style={{ width: '100%', height: 460, objectFit: 'cover', display: 'block' }} />
              </div>
              <div>
                <h2 style={{ fontSize: 30 }}>Let's Make Your Dream Wedding a Reality</h2>
                <p className="muted mt-16" style={{ fontSize: 15, lineHeight: 1.75 }}>
                  With WedBox, planning your perfect wedding in Cyprus has never been easier. Whether you're a local couple or coming from abroad for a destination wedding, we're here to make every moment extraordinary.
                </p>
                <Link href="/contact" className="btn btn-primary mt-24" style={{ display: 'inline-flex' }}>Contact us</Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
