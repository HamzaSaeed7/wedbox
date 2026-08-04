import { useState, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import Icon from '../../components/shared/Icon';
import Logo from '../../components/shared/Logo';
import ServiceCard from '../../components/shared/ServiceCard';
import { useStore, useAuthUser } from '../../store';
import { ordersApi, favoritesApi, conversationsApi, profileApi } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import ToastStack from '../../components/shared/Toast';
import FeedbackWidget from '../../components/shared/FeedbackWidget';

interface DisplayOrder {
  id: number;
  status: string;
  date: string;
  price: number;
  note?: string;
  serviceTitle: string;
  serviceImage: string;
  categoryName: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeApiOrder(o: any): DisplayOrder {
  const imgRaw = o.service?.images?.[0];
  return {
    id: o.id, status: o.status,
    date: formatDate(o.deliver_date ?? o.created_at),
    price: Number(o.price) || 0, note: o.note ?? undefined,
    serviceTitle: o.service?.title ?? '',
    serviceImage: typeof imgRaw === 'string' ? imgRaw : (imgRaw?.url ?? ''),
    categoryName: o.service?.category?.name ?? '',
  };
}

function Shimmer({ w = '100%', h = 16, radius = 6, style = {} }: { w?: string | number; h?: number; radius?: number; style?: React.CSSProperties }) {
  return <div style={{ width: w, height: h, borderRadius: radius, background: 'linear-gradient(90deg,var(--bg-3) 25%,var(--bg-2) 50%,var(--bg-3) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', ...style }} />;
}
function StatSkeleton() {
  return <div className="card card-pad"><Shimmer w={28} h={28} radius={8} /><Shimmer w="55%" h={36} radius={8} style={{ marginTop: 12 }} /><Shimmer w="80%" h={14} radius={6} style={{ marginTop: 8 }} /></div>;
}
function OrderRowSkeleton() {
  return <div className="card order-row-grid" style={{ padding: '14px 16px', marginBottom: 10 }}><Shimmer w={80} h={64} radius={10} /><div style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}><Shimmer w="40%" h={14} /><Shimmer w="70%" h={16} /><Shimmer w="50%" h={12} /></div><div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, justifyContent: 'center' }}><Shimmer w={72} h={22} radius={999} /><Shimmer w={56} h={18} /></div></div>;
}

function Stat({ tone, icon, label, value }: { tone: string; icon: string; label: string; value: number }) {
  const bg: Record<string, string> = { amber: '#FFF7E6', green: '#E6F7F0', neutral: '#F5F5F5', rose: '#FFF0F0', blue: '#E6F0FF' };
  const fg: Record<string, string> = { amber: '#D97706', green: '#059669', neutral: '#6B7280', rose: '#E11D48', blue: '#2563EB' };
  return (
    <div className="card card-pad" style={{ background: bg[tone] || 'white' }}>
      <div className="flex items-center justify-between"><div style={{ color: fg[tone] }}><Icon name={icon} size={20} /></div></div>
      <div style={{ fontSize: 32, fontWeight: 700, marginTop: 12 }}>{value}</div>
      <div className="muted text-13 mt-4">{label}</div>
    </div>
  );
}

function CustomerSidebar({ active }: { active: string }) {
  const { logout } = useStore();
  const [open, setOpen] = useState(false);
  const user = useAuthUser();

  const { data: apiThreads } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => conversationsApi.list(),
    enabled: !!user,
    staleTime: 30_000,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const unreadTotal = (Array.isArray(apiThreads) ? apiThreads : []).reduce((s: number, t: any) => s + (t.unread_count ?? 0), 0);

  const items = [
    { id: '',          to: '/dashboard/buyer',           label: 'Dashboard',  icon: 'home' },
    { id: 'messages',  to: '/dashboard/buyer/messages',  label: 'Messages',   icon: 'msg',      badge: unreadTotal },
    { id: 'favorites', to: '/dashboard/buyer/favorites', label: 'Favorites',  icon: 'heart' },
    { id: 'account',   to: '/dashboard/buyer/account',   label: 'My Account', icon: 'settings' },
  ];
  return (
    <aside className={`dash-side${open ? ' open' : ''}`} style={{ background: 'var(--primary)' }}>
      <div className="dash-side-top">
        <div className="brand" style={{ color: 'white', justifyContent: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none' }}><Logo light compact /></Link>
        </div>
        <button className="dash-burger" onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
          <Icon name={open ? 'close' : 'menu'} size={22} color="white" />
        </button>
      </div>
      <nav className="dash-nav">
        {items.map((i) => (
          <Link key={i.id} href={i.to} onClick={() => setOpen(false)}
            style={{ background: active === i.id ? 'rgba(255,255,255,.18)' : 'transparent', color: 'white', fontWeight: active === i.id ? 700 : 500, display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, fontSize: 14, textDecoration: 'none' }}>
            <Icon name={i.icon} size={18} color="white" /> {i.label}
            {i.badge ? <span style={{ marginLeft: 'auto', background: '#E11D48', color: 'white', borderRadius: 999, fontSize: 11, fontWeight: 700, minWidth: 18, height: 18, display: 'grid', placeItems: 'center', padding: '0 5px' }}>{i.badge}</span> : null}
          </Link>
        ))}
      </nav>
      <div className="dash-side-foot" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <FeedbackWidget />
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, color: 'white', fontWeight: 500, fontSize: 14, background: 'rgba(255,255,255,.1)', textDecoration: 'none' }}>
          <Icon name="home" size={18} color="white" /> Back to site
        </Link>
        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, color: 'white', fontWeight: 500, fontSize: 14, background: 'rgba(255,255,255,.08)', border: 0, cursor: 'pointer', width: '100%' }}>
          <Icon name="logout" size={18} color="white" /> Sign out
        </button>
      </div>
    </aside>
  );
}

function OrderRow({ order }: { order: DisplayOrder }) {
  const qc = useQueryClient();
  const showToast = useStore((s) => s.showToast);
  const statusStyle: Record<string, { bg: string; color: string }> = {
    pending:   { bg: '#FFF7E6', color: '#D97706' },
    approved:  { bg: '#E6F7F0', color: '#059669' },
    rejected:  { bg: '#FFF0F0', color: '#E11D48' },
    completed: { bg: '#F0F0F5', color: '#6B7280' },
    cancelled: { bg: '#F5F5F5', color: '#9CA3AF' },
  };
  const ss = statusStyle[order.status] || statusStyle.pending;

  const cancelMutation = useMutation({
    mutationFn: () => ordersApi.cancel(order.id),
    onSuccess: () => {
      showToast('Booking cancelled.', 'success');
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['orders-summary'] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      showToast(err?.response?.data?.message ?? 'Could not cancel booking.', 'error'),
  });

  const handleCancel = () => {
    if (window.confirm('Cancel this booking? This cannot be undone.')) cancelMutation.mutate();
  };

  return (
    <div className="card order-row-grid" style={{ padding: '14px 16px', marginBottom: 10 }}>
      {order.serviceImage
        ? <img src={order.serviceImage} alt="" style={{ width: '100%', aspectRatio: '1/1', borderRadius: 10, objectFit: 'cover', display: 'block' }} />
        : <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: 10, background: 'var(--bg-3)' }} />
      }
      <div>
        <div className="flex items-center gap-8">
          <span className="chip chip-soft" style={{ fontSize: 11 }}>{order.categoryName}</span>
          <span className="muted text-12">{order.date}</span>
        </div>
        <div className="fw-700 mt-4">{order.serviceTitle}</div>
        {order.note && <div className="muted text-12 mt-4">{order.note}</div>}
        {order.status === 'pending' && (
          <button
            onClick={handleCancel}
            disabled={cancelMutation.isPending}
            className="text-12 fw-600 mt-8"
            style={{ background: 'transparent', border: 0, padding: 0, color: '#E11D48', cursor: cancelMutation.isPending ? 'wait' : 'pointer' }}
          >
            {cancelMutation.isPending ? 'Cancelling…' : 'Cancel booking'}
          </button>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: ss.bg, color: ss.color }}>{order.status}</span>
        <span className="fw-700">€{order.price.toLocaleString()}</span>
      </div>
    </div>
  );
}

function BuyerHome() {
  const [tab, setTab] = useState('pending');
  const tabs = ['pending', 'approved', 'rejected', 'completed', 'cancelled'];
  const user = useAuthUser();

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['orders-summary'],
    queryFn: () => ordersApi.summary(),
    enabled: !!user,
    staleTime: 30_000,
  });

  const { data: ordersResult, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders', tab],
    queryFn: () => ordersApi.list({ status: tab }),
    enabled: !!user,
    staleTime: 30_000,
  });

  const isLoading = summaryLoading || ordersLoading;
  const apiOrders: DisplayOrder[] = (ordersResult?.data ?? []).map(normalizeApiOrder);
  const counts = summary?.counts_by_status ?? {};
  const totalCost = summary?.total_spent ?? 0;

  return (
    <div>
      <h1 style={{ fontSize: 32 }}>My Bookings</h1>
      <div className="grid r-grid-4 mt-20" style={{ gap: 16 }}>
        {isLoading ? (
          <><StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton /></>
        ) : (
          <>
            <Stat tone="amber"   icon="clock"    label="Pending Approval" value={counts.pending   || 0} />
            <Stat tone="green"   icon="check"    label="Approved Orders"  value={counts.approved  || 0} />
            <Stat tone="neutral" icon="bookings" label="Total Orders"     value={counts.total     || Object.values(counts).reduce((s: number, n) => s + Number(n), 0)} />
            <Stat tone="rose"    icon="close"    label="Declined Orders"  value={counts.rejected  || 0} />
          </>
        )}
      </div>
      <div className="card mt-24">
        <div className="flex items-center justify-between" style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)' }}>
          <h3 style={{ fontSize: 18 }}>Bookings</h3>
          {!isLoading && (
            <div className="flex items-center gap-8">
              <span className="fw-700 text-13">Total Cost:</span>
              <span className="fw-700" style={{ color: 'var(--primary-700)' }}>€{totalCost.toLocaleString()}</span>
            </div>
          )}
        </div>
        <div className="tabs" style={{ padding: '0 18px' }}>
          {tabs.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`tab ${tab === t ? 'tab-active' : ''}`} style={{ background: 'transparent', border: 0, textTransform: 'capitalize' }}>{t}</button>
          ))}
        </div>
        <div style={{ padding: '16px 18px' }}>
          {isLoading ? (
            <><OrderRowSkeleton /><OrderRowSkeleton /><OrderRowSkeleton /></>
          ) : (
            <>
              {apiOrders.length === 0 && <div className="muted text-14 text-center" style={{ padding: '30px 0' }}>No {tab} orders.</div>}
              {apiOrders.map((o) => <OrderRow key={o.id} order={o} />)}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function BuyerMessages() {
  // Pre-select a conversation opened via "Contact vendor" (?conversation=123)
  const [active, setActive] = useState<number | null>(() => {
    const id = Number(new URLSearchParams(window.location.search).get('conversation'));
    return id > 0 ? id : null;
  });
  const [msg, setMsg] = useState('');
  const qc = useQueryClient();
  const user = useAuthUser();

  const { data: apiThreads } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => conversationsApi.list(),
    enabled: !!user,
    staleTime: 30_000,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const threads: any[] = Array.isArray(apiThreads) ? apiThreads : [];
  const activeId = active ?? threads[0]?.id ?? null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const thread = threads.find((t: any) => t.id === activeId) ?? threads[0] ?? null;

  const { data: apiMessages } = useQuery({
    queryKey: ['conversation-messages', activeId],
    queryFn: () => conversationsApi.messages(activeId as number),
    enabled: !!activeId,
    staleTime: 10_000,
  });

  // Opening a conversation marks its messages read on the backend — refresh
  // the thread list so the unread badge clears.
  useEffect(() => { if (apiMessages) qc.invalidateQueries({ queryKey: ['conversations'] }); }, [apiMessages, qc]);

  const sendMutation = useMutation({
    mutationFn: (body: string) => conversationsApi.send(activeId as number, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['conversation-messages', activeId] }); setMsg(''); },
  });

  type MsgItem = { from: 'me' | 'them'; text: string; time: string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const displayMessages: MsgItem[] = Array.isArray((apiMessages as any)?.data ?? apiMessages)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? ((apiMessages as any)?.data ?? apiMessages as any[]).map((m: any): MsgItem => ({
        from: m.sender_id === user?.id ? 'me' : 'them',
        text: m.body,
        time: m.created_at?.slice(11, 16) ?? '',
      }))
    : [];

  if (threads.length === 0) return (
    <div>
      <h1 style={{ fontSize: 32, marginBottom: 20 }}>Messages</h1>
      <div className="card card-pad" style={{ textAlign: 'center', padding: 60 }}>
        <Icon name="msg" size={36} color="var(--line)" />
        <div className="fw-700 mt-12">No conversations yet</div>
        <p className="muted text-14 mt-8">Messages with your vendors will appear here.</p>
      </div>
    </div>
  );

  return (
    <div>
      <h1 style={{ fontSize: 32, marginBottom: 20 }}>Messages</h1>
      <div className="card dash-msg-pane dash-msg-wrap">
        <div style={{ overflow: 'auto' }}>
          <div style={{ height: 57, padding: '0 16px', display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--line)', boxSizing: 'border-box' }}>
            <div className="input flex items-center gap-8" style={{ padding: '6px 12px', flex: 1 }}>
              <Icon name="search" size={14} color="var(--muted)" />
              <input placeholder="Search" style={{ border: 0, outline: 'none', background: 'transparent', fontSize: 13, width: '100%' }} />
            </div>
          </div>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {threads.map((t: any) => {
            const vendorName = t.vendor?.vendorProfile?.business_name ?? t.vendor?.name ?? t.name ?? '—';
            const avatarUrl  = t.vendor?.profile?.avatar_url ?? t.avatar;
            const lastMsg    = t.last_message?.body ?? t.last ?? '';
            const timeStr    = t.last_message_at?.slice(11, 16) ?? '';
            const unread     = t.unread_count ?? t.unread ?? 0;
            return (
              <div key={t.id} onClick={() => setActive(t.id)}
                style={{ padding: '14px 16px', cursor: 'pointer', background: activeId === t.id ? 'var(--primary-50)' : 'white', borderBottom: '1px solid var(--line-2)', display: 'flex', gap: 12, alignItems: 'center' }}>
                {avatarUrl
                  ? <img src={avatarUrl} alt="" style={{ width: 40, height: 40, borderRadius: 999, objectFit: 'cover', flexShrink: 0 }} />
                  : <div style={{ width: 40, height: 40, borderRadius: 999, background: 'var(--primary-50)', color: 'var(--primary-700)', display: 'grid', placeItems: 'center', fontWeight: 700, flexShrink: 0 }}>{vendorName[0]}</div>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center justify-between">
                    <span className="fw-700 text-13">{vendorName}</span>
                    <span className="muted text-11">{timeStr}</span>
                  </div>
                  <div className="text-12 muted" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>{lastMsg}</div>
                </div>
                {unread > 0 && <span style={{ background: 'var(--primary)', color: 'white', borderRadius: 999, fontSize: 10, fontWeight: 700, minWidth: 18, height: 18, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{unread}</span>}
              </div>
            );
          })}
        </div>
        <div className="dash-msg-chat" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: 57, padding: '0 20px', borderBottom: '1px solid var(--line)', background: 'var(--bg-2)', display: 'flex', alignItems: 'center', gap: 12, boxSizing: 'border-box' }}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <span className="fw-700">{(thread as any)?.vendor?.vendorProfile?.business_name ?? (thread as any)?.vendor?.name ?? '—'}</span>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {displayMessages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.from === 'me' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '72%', padding: '10px 14px', borderRadius: m.from === 'me' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: m.from === 'me' ? 'var(--primary)' : 'var(--bg-2)', color: m.from === 'me' ? 'white' : 'var(--ink)', fontSize: 14 }}>
                  {m.text}<div style={{ fontSize: 10, opacity: .7, marginTop: 4 }}>{m.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--line)', display: 'flex', gap: 10 }}>
            <input className="input" style={{ flex: 1 }} placeholder="Type your message…" value={msg} onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && msg.trim()) sendMutation.mutate(msg.trim()); }} />
            <button className="btn btn-primary" style={{ padding: '0 18px' }} onClick={() => { if (msg.trim()) sendMutation.mutate(msg.trim()); }}>
              <Icon name="send" size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BuyerFavorites() {
  const { favorites, setFavorites } = useStore();
  const user = useAuthUser();

  const { data: apiFavs } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesApi.list(),
    enabled: !!user,
    staleTime: 60_000,
  });

  const hasApiFavs = Array.isArray(apiFavs) && apiFavs.length > 0;
  if (hasApiFavs) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ids = (apiFavs as any[]).map((f: any) => f.id).filter(Boolean);
    if (ids.length !== favorites.size) setFavorites(ids);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalizeApiService = (s: any) => ({
    id: s.id, slug: s.category?.slug ?? s.slug ?? '',
    vendor: s.vendor?.vendorProfile?.business_name ?? s.vendor?.name ?? '',
    title: s.title ?? '', location: s.location ?? '',
    images: Array.isArray(s.images) ? s.images.map((img: string | { url: string }) => typeof img === 'string' ? img : img.url).filter(Boolean) : [],
    minimum_price: Number(s.minimum_price) || 0, rating: Number(s.rating) || 0,
    reviews: s.review_count ?? 0, featured: s.is_featured ?? false, description: s.description ?? '',
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const favServices = hasApiFavs ? (apiFavs as any[]).map(normalizeApiService) : [];

  return (
    <div>
      <h1 style={{ fontSize: 32, marginBottom: 20 }}>Favorites</h1>
      {favServices.length === 0 && (
        <div className="card card-pad" style={{ textAlign: 'center', padding: 60 }}>
          <Icon name="heart" size={36} color="var(--line)" />
          <div className="fw-700 mt-12">No saved services yet</div>
          <Link href="/search" className="btn btn-primary mt-16">Browse vendors</Link>
        </div>
      )}
      <div className="grid dash-grid-3" style={{ gap: 20 }}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {favServices.map((s: any) => <ServiceCard key={s.id} service={s} />)}
      </div>
    </div>
  );
}

function BuyerAccount() {
  const user = useAuthUser();
  const { setUser } = useStore();
  const qc = useQueryClient();

  const [firstName, setFirstName] = useState(user?.profile?.first_name ?? '');
  const [lastName,  setLastName]  = useState(user?.profile?.last_name ?? '');
  const [profSaved, setProfSaved] = useState(false);
  const [addr1,   setAddr1]   = useState(user?.profile?.address1 ?? '');
  const [addr2,   setAddr2]   = useState(user?.profile?.address2 ?? '');
  const [postal,  setPostal]  = useState(user?.profile?.postal_code ?? '');
  const [city,    setCity]    = useState(user?.profile?.city ?? '');
  const [country, setCountry] = useState(user?.profile?.country ?? '');
  const [phone,   setPhone]   = useState(user?.profile?.phone ?? '');
  const [addrSaved, setAddrSaved] = useState(false);
  const [curPwd,  setCurPwd]  = useState('');
  const [newPwd,  setNewPwd]  = useState('');
  const [confPwd, setConfPwd] = useState('');
  const [pwdMsg,  setPwdMsg]  = useState('');

  useEffect(() => {
    if (!user) return;
    setFirstName(user.profile?.first_name ?? ''); setLastName(user.profile?.last_name ?? '');
    setAddr1(user.profile?.address1 ?? ''); setAddr2(user.profile?.address2 ?? '');
    setPostal(user.profile?.postal_code ?? ''); setCity(user.profile?.city ?? '');
    setCountry(user.profile?.country ?? ''); setPhone(user.profile?.phone ?? '');
  }, [user]);

  const profMutation = useMutation({
    mutationFn: () => profileApi.update({ first_name: firstName, last_name: lastName }),
    onSuccess: (data) => { setUser(data); qc.invalidateQueries({ queryKey: ['auth-user'] }); setProfSaved(true); setTimeout(() => setProfSaved(false), 2500); },
  });
  const addrMutation = useMutation({
    mutationFn: () => profileApi.update({ address1: addr1, address2: addr2, postal_code: postal, city, country: 'Cyprus', phone }),
    onSuccess: (data) => { setUser(data); qc.invalidateQueries({ queryKey: ['auth-user'] }); setAddrSaved(true); setTimeout(() => setAddrSaved(false), 2500); },
  });
  const pwdMutation = useMutation({
    mutationFn: () => profileApi.updatePassword({ current_password: curPwd, password: newPwd, password_confirmation: confPwd }),
    onSuccess: () => { setPwdMsg('Password updated!'); setCurPwd(''); setNewPwd(''); setConfPwd(''); },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (e: any) => setPwdMsg(e?.response?.data?.message ?? 'Update failed.'),
  });

  return (
    <div>
      <h1 style={{ fontSize: 32, marginBottom: 20 }}>My Account</h1>
      <div className="grid dash-grid-3" style={{ gap: 20 }}>
        <div className="card card-pad">
          <h3 style={{ fontSize: 17 }}>Profile</h3>
          <div className="flex items-center gap-14 mt-16">
            {user?.profile?.avatar_url
              ? <img src={user.profile.avatar_url} alt="" style={{ width: 56, height: 56, borderRadius: 999, objectFit: 'cover' }} />
              : <div style={{ width: 56, height: 56, borderRadius: 999, background: 'var(--primary)', display: 'grid', placeItems: 'center', color: 'white', fontSize: 20, fontWeight: 700 }}>{firstName?.[0] ?? '?'}</div>
            }
          </div>
          <div className="mt-16" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div><label className="field-label">Email</label><input className="input mt-4" value={user?.email ?? ''} disabled style={{ opacity: .6 }} /></div>
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div><label className="field-label">First name</label><input className="input mt-4" value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
              <div><label className="field-label">Last name</label><input className="input mt-4" value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
            </div>
          </div>
          {profMutation.isError && <p className="mt-8 text-13" style={{ color: '#E11D48' }}>Save failed.</p>}
          <button className="btn btn-primary btn-block mt-16" onClick={() => profMutation.mutate()} disabled={profMutation.isPending || !user}>
            {profSaved ? '✓ Saved' : profMutation.isPending ? 'Saving…' : 'Update profile'}
          </button>
        </div>
        <div className="card card-pad">
          <h3 style={{ fontSize: 17 }}>Address</h3>
          <div className="mt-16" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div><label className="field-label">Address 1</label><input className="input mt-4" value={addr1} onChange={(e) => setAddr1(e.target.value)} /></div>
            <div><label className="field-label">Address 2</label><input className="input mt-4" value={addr2} onChange={(e) => setAddr2(e.target.value)} /></div>
            <div><label className="field-label">Postal code</label><input className="input mt-4" value={postal} onChange={(e) => setPostal(e.target.value)} /></div>
            <div><label className="field-label">City</label><input className="input mt-4" value={city} onChange={(e) => setCity(e.target.value)} /></div>
            <div><label className="field-label">Country</label><input className="input mt-4" value="Cyprus" readOnly style={{ background: 'var(--bg-2)', color: 'var(--muted)', cursor: 'default' }} /></div>
            <div><label className="field-label">Phone</label><input className="input mt-4" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          </div>
          {addrMutation.isError && <p className="mt-8 text-13" style={{ color: '#E11D48' }}>Save failed.</p>}
          <button className="btn btn-primary btn-block mt-16" onClick={() => addrMutation.mutate()} disabled={addrMutation.isPending || !user}>
            {addrSaved ? '✓ Saved' : addrMutation.isPending ? 'Saving…' : 'Update address'}
          </button>
        </div>
        <div className="card card-pad">
          <h3 style={{ fontSize: 17 }}>Security</h3>
          <div className="mt-16" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div><label className="field-label">Current password</label><input type="password" className="input mt-4" value={curPwd} onChange={(e) => setCurPwd(e.target.value)} /></div>
            <div><label className="field-label">New password</label><input type="password" className="input mt-4" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} /></div>
            <div><label className="field-label">Confirm password</label><input type="password" className="input mt-4" value={confPwd} onChange={(e) => setConfPwd(e.target.value)} /></div>
          </div>
          {pwdMsg && <p className="mt-8 text-13" style={{ color: pwdMsg.startsWith('Password updated') ? '#059669' : '#E11D48' }}>{pwdMsg}</p>}
          <button className="btn btn-primary btn-block mt-16" onClick={() => pwdMutation.mutate()} disabled={pwdMutation.isPending || !curPwd || !newPwd || !user}>
            {pwdMutation.isPending ? 'Updating…' : 'Update password'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface CustomerProps {
  sub?: string;
}

export default function CustomerDashboard({ sub: subProp }: CustomerProps) {
  const pageProps = usePage().props as CustomerProps;
  const sub = subProp ?? pageProps.sub ?? '';
  const user = useAuthUser();

  useEffect(() => {
    if (!user) router.visit('/auth');
  }, [user]);

  useEffect(() => {
    document.title = 'My Dashboard | Wedbi';
    return () => { document.title = 'Wedbi'; };
  }, []);

  if (!user) return null;

  return (
    <div className="dash-shell">
      <ToastStack />
      <CustomerSidebar active={sub} />
      <main className="dash-main">
        {(sub === '' || sub === 'orders') && <BuyerHome />}
        {sub === 'messages'  && <BuyerMessages />}
        {sub === 'favorites' && <BuyerFavorites />}
        {sub === 'account'   && <BuyerAccount />}
      </main>
    </div>
  );
}
