import { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Icon from '../../components/shared/Icon';
import Logo from '../../components/shared/Logo';
import Stars from '../../components/shared/Stars';
import { useStore, useAuthUser } from '../../store';
import { vendorApi, uploadApi, conversationsApi } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import CurrencyInput from '../../components/shared/CurrencyInput';
import ServiceSubdataEditor from '../../components/vendor/ServiceSubdataEditor';
import FeedbackWidget from '../../components/shared/FeedbackWidget';

function Stat({ tone, icon, label, value }: { tone: string; icon: string; label: string; value: number | string }) {
  const bg: Record<string, string> = { amber: '#FFF7E6', green: '#E6F7F0', neutral: '#F5F5F5', rose: '#FFF0F0', blue: '#E6F0FF' };
  const fg: Record<string, string> = { amber: '#D97706', green: '#059669', neutral: '#6B7280', rose: '#E11D48', blue: '#2563EB' };
  return (
    <div className="card card-pad" style={{ background: bg[tone] || 'white' }}>
      <div style={{ color: fg[tone] }}><Icon name={icon} size={20} /></div>
      <div style={{ fontSize: 32, fontWeight: 700, marginTop: 12 }}>{value}</div>
      <div className="muted text-13 mt-4">{label}</div>
    </div>
  );
}

function VendorSidebar({ active }: { active: string }) {
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
    { id: '',        href: '/dashboard/vendor',          label: 'Dashboard', icon: 'home' },
    { id: 'service', href: '/dashboard/vendor/service',  label: 'Service',   icon: 'services' },
    { id: 'orders',  href: '/dashboard/vendor/orders',   label: 'Orders',    icon: 'bookings' },
    { id: 'messages',href: '/dashboard/vendor/messages', label: 'Messages',  icon: 'msg',      badge: unreadTotal },
    { id: 'billing', href: '/dashboard/vendor/billing',  label: 'Billing',   icon: 'billing' },
    { id: 'settings',href: '/dashboard/vendor/settings', label: 'Settings',  icon: 'settings' },
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
          <Link key={i.id} href={i.href} onClick={() => setOpen(false)}
            style={{ background: active === i.id ? 'rgba(255,255,255,.18)' : 'transparent',
              color: 'white', fontWeight: active === i.id ? 700 : 500,
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
              borderRadius: 10, fontSize: 14, textDecoration: 'none' }}>
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

// ─── Dashboard home
function VendorHome() {
  const user = useAuthUser();
  const { data: ordersResult, isLoading: ordersLoading } = useQuery({
    queryKey: ['vendor-orders-all'],
    queryFn: () => vendorApi.orders(),
    enabled: !!user,
    staleTime: 30_000,
  });

  const { data: apiServices } = useQuery({
    queryKey: ['vendor-services'],
    queryFn: () => vendorApi.services(),
    enabled: !!user,
    staleTime: 60_000,
  });

  const svcList: any[] = Array.isArray(apiServices) // eslint-disable-line @typescript-eslint/no-explicit-any
    ? apiServices
    : (apiServices as any)?.data ?? []; // eslint-disable-line @typescript-eslint/no-explicit-any
  const firstSvc: any = svcList[0] ?? null; // eslint-disable-line @typescript-eslint/no-explicit-any

  const { data: fullService } = useQuery({
    queryKey: ['vendor-service', firstSvc?.id],
    queryFn: () => vendorApi.showService(firstSvc!.id),
    enabled: !!firstSvc?.id,
    staleTime: 60_000,
  });

  const svc: any = fullService ?? firstSvc; // eslint-disable-line @typescript-eslint/no-explicit-any

  const svcImages: string[] = svc
    ? (svc.images ?? []).map((img: any) => typeof img === 'string' ? img : img?.url).filter(Boolean) // eslint-disable-line @typescript-eslint/no-explicit-any
    : [];

  const profileChecks = [
    { label: 'Profile photo',  done: !!(user as any)?.vendorProfile?.avatar_url, href: '/dashboard/vendor/settings' }, // eslint-disable-line @typescript-eslint/no-explicit-any
    { label: 'Description',    done: !!(svc?.description?.trim()), href: '/dashboard/vendor/service' },
    { label: 'Pricing set',    done: !!(svc?.minimum_price && Number(svc.minimum_price) > 0), href: '/dashboard/vendor/service' },
    { label: 'Min. 2 images',  done: svcImages.length >= 2, href: '/dashboard/vendor/service' },
  ];
  const completedCount = profileChecks.filter((c) => c.done).length;
  const strengthPct = Math.round((completedCount / profileChecks.length) * 100);

  const dbOrders: any[] = ordersResult?.data ?? []; // eslint-disable-line @typescript-eslint/no-explicit-any
  const displayOrders = dbOrders;

  const stats = {
    approved: dbOrders.filter((o: any) => o.status === 'approved').length, // eslint-disable-line @typescript-eslint/no-explicit-any
    pending:  dbOrders.filter((o: any) => o.status === 'pending').length,  // eslint-disable-line @typescript-eslint/no-explicit-any
    revenue:  dbOrders.filter((o: any) => ['approved', 'completed'].includes(o.status)).reduce((s: number, o: any) => s + Number(o.price), 0), // eslint-disable-line @typescript-eslint/no-explicit-any
    total:    ordersResult?.meta?.total ?? 0,
  };

  return (
    <div>
      <h1 style={{ fontSize: 32 }}>Vendor Dashboard</h1>
      <div className="grid r-grid-4 mt-20" style={{ gap: 16 }}>
        {ordersLoading ? (
          [1,2,3,4].map((i) => (
            <div key={i} className="card card-pad">
              <div style={{ height: 20, width: 28, borderRadius: 6, background: 'linear-gradient(90deg,var(--bg-3) 25%,var(--bg-2) 50%,var(--bg-3) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
              <div style={{ height: 36, width: '55%', borderRadius: 8, marginTop: 12, background: 'linear-gradient(90deg,var(--bg-3) 25%,var(--bg-2) 50%,var(--bg-3) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
              <div style={{ height: 14, width: '80%', borderRadius: 6, marginTop: 8, background: 'linear-gradient(90deg,var(--bg-3) 25%,var(--bg-2) 50%,var(--bg-3) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
            </div>
          ))
        ) : (
          <>
            <Stat tone="green"   icon="check"    label="Approved Orders"  value={stats.approved} />
            <Stat tone="amber"   icon="clock"    label="Pending Orders"   value={stats.pending} />
            <Stat tone="blue"    icon="billing"  label="Revenue (€)"      value={`€${stats.revenue.toLocaleString()}`} />
            <Stat tone="neutral" icon="bookings" label="Total Orders"     value={stats.total} />
          </>
        )}
      </div>
      <div className="grid mt-24 dash-home-split" style={{ gap: 20 }}>
        <div className="card card-pad">
          <h3 style={{ fontSize: 17 }}>Recent activity</h3>
          <div className="mt-16" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ordersLoading && [1,2,3].map((i) => (
              <div key={i} style={{ height: 64, borderRadius: 12, background: 'linear-gradient(90deg,var(--bg-3) 25%,var(--bg-2) 50%,var(--bg-3) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
            ))}
            {!ordersLoading && displayOrders.length === 0 && (
              <div className="muted text-14 text-center" style={{ padding: '20px 0' }}>No recent activity.</div>
            )}
            {!ordersLoading && displayOrders.slice(0, 5).map((o: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
              const title  = o.service?.title ?? '—';
              const imgRaw = o.service?.images?.[0];
              const img    = typeof imgRaw === 'string' ? imgRaw : (imgRaw?.url ?? '');
              const date   = formatDate(o.deliver_date ?? o.created_at);
              return (
                <div key={o.id} className="flex items-center gap-12" style={{ padding: '10px 14px', background: 'var(--bg-2)', borderRadius: 12 }}>
                  {img ? <img src={img} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
                       : <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--bg-3)' }} />}
                  <div style={{ flex: 1 }}>
                    <div className="fw-600 text-14">{title}</div>
                    <div className="muted text-12">{date}</div>
                  </div>
                  <span className="fw-700">€{Number(o.price).toLocaleString()}</span>
                  <span className={`chip ${o.status === 'approved' ? 'chip-green' : o.status === 'pending' ? 'chip-amber' : ''}`}>{o.status}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="card card-pad" style={{ background: 'linear-gradient(135deg, var(--primary-50), var(--bg-2))' }}>
          <div className="flex items-center" style={{ justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 17 }}>Profile strength</h3>
            <span className="fw-700 text-14" style={{ color: strengthPct === 100 ? 'var(--primary)' : 'var(--ink)' }}>{strengthPct}%</span>
          </div>
          <div style={{ marginTop: 8, height: 6, borderRadius: 99, background: 'var(--bg-3)' }}>
            <div style={{ height: '100%', borderRadius: 99, background: 'var(--primary)', width: `${strengthPct}%`, transition: 'width .4s ease' }} />
          </div>
          <p className="muted text-13 mt-8">Complete your listing to reach more couples.</p>
          <div className="mt-16" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {profileChecks.map((item) => (
              <Link key={item.label} href={item.done ? '#' : item.href}
                style={{ textDecoration: 'none', pointerEvents: item.done ? 'none' : 'auto' }}
                onClick={(e) => { if (item.done) e.preventDefault(); }}>
                <div className="flex items-center gap-8" style={{ opacity: item.done ? 1 : 0.85 }}>
                  <Icon name={item.done ? 'check' : 'close'} size={14} color={item.done ? 'var(--primary)' : 'var(--muted)'} />
                  <span className="text-13" style={{ color: item.done ? 'var(--ink)' : 'var(--muted)', textDecoration: item.done ? 'none' : 'underline dotted' }}>{item.label}</span>
                </div>
              </Link>
            ))}
          </div>
          {strengthPct < 100 ? (
            <Link href={profileChecks.find((c) => !c.done)?.href ?? '/dashboard/vendor/service'} className="btn btn-primary btn-block mt-20">
              Complete profile
            </Link>
          ) : (
            <div className="btn btn-primary btn-block mt-20" style={{ opacity: .75, cursor: 'default', textAlign: 'center' }}>
              Profile complete ✓
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Service editor
function VendorService() {
  const user = useAuthUser();
  const { showToast } = useStore();
  const qc = useQueryClient();
  const [tab, setTab] = useState<'info' | 'reviews'>('info');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: apiServices } = useQuery({
    queryKey: ['vendor-services'],
    queryFn: () => vendorApi.services(),
    enabled: !!user,
    staleTime: 60_000,
  });

  const svcList: any[] = Array.isArray(apiServices) // eslint-disable-line @typescript-eslint/no-explicit-any
    ? apiServices
    : (apiServices as any)?.data ?? []; // eslint-disable-line @typescript-eslint/no-explicit-any

  useEffect(() => {
    if (svcList.length > 0 && !selectedId) {
      setSelectedId(svcList[0].id);
    }
  }, [svcList.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: fullService, isLoading: isLoadingFull } = useQuery({
    queryKey: ['vendor-service', selectedId],
    queryFn: () => vendorApi.showService(selectedId!),
    enabled: !!selectedId,
    staleTime: 60_000,
  });

  const apiSvc: any = fullService ?? svcList.find((s: any) => s.id === selectedId) ?? svcList[0] ?? null; // eslint-disable-line @typescript-eslint/no-explicit-any

  const [svcTitle, setSvcTitle]         = useState('');
  const [svcDesc,  setSvcDesc]          = useState('');
  const [svcLoc,   setSvcLoc]           = useState('');
  const [svcPrice, setSvcPrice]         = useState('');
  const [saved, setSaved]               = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [newDate, setNewDate]           = useState('');

  useEffect(() => {
    if (!apiSvc) return;
    setSvcTitle(apiSvc.title ?? '');
    setSvcDesc(apiSvc.description ?? '');
    setSvcLoc(apiSvc.location ?? '');
    setSvcPrice(String(apiSvc.minimum_price ?? ''));
  }, [apiSvc?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const imgs: string[] = apiSvc
    ? (apiSvc.images ?? []).map((img: any) => typeof img === 'string' ? img : img.url).filter(Boolean) // eslint-disable-line @typescript-eslint/no-explicit-any
    : [];
  const rating = Number(apiSvc?.rating ?? 0);
  const reviewCount = apiSvc?.review_count ?? 0;
  const apiReviews: any[] = apiSvc?.reviews ?? []; // eslint-disable-line @typescript-eslint/no-explicit-any

  const updateMutation = useMutation({
    mutationFn: () => vendorApi.updateService(apiSvc.id, { title: svcTitle, description: svcDesc, location: svcLoc, minimum_price: Number(svcPrice) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-services'] });
      qc.invalidateQueries({ queryKey: ['vendor-service', apiSvc.id] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const subdataMutation = useMutation({
    mutationFn: (data: object) => vendorApi.updateSubdata(apiSvc.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-service', apiSvc.id] });
      showToast('Service details saved!');
    },
    onError: () => showToast('Failed to save details. Please try again.', 'error'),
  });

  const publishMutation = useMutation({
    mutationFn: () => vendorApi.updateService(apiSvc.id, { status: 'active' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-services'] });
      qc.invalidateQueries({ queryKey: ['vendor-service', apiSvc.id] });
      showToast('Service published! It is now visible to customers.', 'success');
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: () => vendorApi.updateService(apiSvc.id, { status: 'draft' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-services'] });
      qc.invalidateQueries({ queryKey: ['vendor-service', apiSvc.id] });
      showToast('Service unpublished and set to draft.', 'info');
    },
    onError: () => showToast('Failed to unpublish. Please try again.', 'error'),
  });

  const svcStatus = apiSvc?.status ?? 'draft';
  const isPublished = svcStatus === 'active';

  return (
    <div>
      <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 32 }}>My Service</h1>
        <div className="flex gap-10" style={{ flexWrap: 'wrap' }}>
          {apiSvc && (<>
            {!isPublished && (
              <span className="chip" style={{ background: '#FFF7E6', color: '#D97706', fontWeight: 700, fontSize: 12, border: '1px solid #FDE68A' }}>
                Draft — not visible to customers
              </span>
            )}
            {isPublished
              ? <button className="btn btn-ghost" style={{ color: '#E11D48' }} onClick={() => unpublishMutation.mutate()} disabled={unpublishMutation.isPending}>Unpublish</button>
              : <button className="btn btn-primary" style={{ background: '#059669', borderColor: '#059669' }} onClick={() => publishMutation.mutate()} disabled={publishMutation.isPending}>
                  {publishMutation.isPending ? 'Publishing…' : 'Publish'}
                </button>
            }
          </>)}
          {tab === 'info' && (
            <button className="btn btn-primary" onClick={() => apiSvc && updateMutation.mutate()} disabled={!apiSvc || updateMutation.isPending}>
              {saved ? '✓ Saved' : updateMutation.isPending ? 'Saving…' : 'Update'}
            </button>
          )}
        </div>
      </div>

      {/* Multi-service selector */}
      {svcList.length > 1 && (
        <div className="flex gap-8 mt-16" style={{ flexWrap: 'wrap' }}>
          {svcList.map((s: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
            <button key={s.id} onClick={() => setSelectedId(s.id)}
              className={selectedId === s.id ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}>
              {s.title}
            </button>
          ))}
        </div>
      )}

      {!apiSvc && !svcList.length && <p className="muted mt-8 text-13">No service found. Create your first listing to get started.</p>}

      {/* Tab row */}
      <div className="tabs mt-20">
        {(['info', 'reviews'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`tab ${tab === t ? 'tab-active' : ''}`}
            style={{ background: 'transparent', border: 0 }}>
            {t === 'info' ? 'Service Info' : 'Reviews'}
          </button>
        ))}
      </div>

      {/* ── Basic Info + Service Details (merged) ── */}
      {tab === 'info' && (
        <div className="card card-pad mt-16">
          <div><label className="field-label">Service title</label>
            <input className="input mt-8" value={svcTitle} onChange={(e) => setSvcTitle(e.target.value)} /></div>
          <div className="mt-16">
            <div className="flex gap-12">
              <div style={{ flex: 1 }}><label className="field-label">Location</label><input className="input mt-8" value={svcLoc} onChange={(e) => setSvcLoc(e.target.value)} /></div>
              <div style={{ width: 140 }}><label className="field-label">Min. price (€)</label><CurrencyInput className="input mt-8" value={svcPrice} onChange={(e) => setSvcPrice(e.target.value)} /></div>
            </div>
          </div>
          <div className="mt-16">
            <label className="field-label">Images <span className="muted fw-500 text-12">(minimum 2 required)</span></label>
            <div className="dash-img-4 mt-8">
              {imgs.map((im, i) => (
                <div key={i} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 12, overflow: 'hidden' }}>
                  <img src={im} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={() => {
                      const newImgs = imgs.filter((_, j) => j !== i);
                      vendorApi.updateService(apiSvc.id, { images: newImgs }).then(() => {
                        qc.invalidateQueries({ queryKey: ['vendor-services'] });
                        qc.invalidateQueries({ queryKey: ['vendor-service', apiSvc.id] });
                      });
                    }}
                    style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 999, background: 'rgba(0,0,0,0.55)', border: 0, color: 'white', cursor: 'pointer', display: 'grid', placeItems: 'center', lineHeight: 1 }}
                  >
                    <Icon name="close" size={10} color="white" />
                  </button>
                </div>
              ))}
              <label style={{ aspectRatio: '1/1', borderRadius: 12, border: '2px dashed var(--line)', display: 'grid', placeItems: 'center', cursor: uploadingImg ? 'wait' : 'pointer', color: 'var(--muted)', opacity: uploadingImg ? 0.6 : 1 }}>
                <div style={{ textAlign: 'center' }}>
                  {uploadingImg
                    ? <div className="text-11">Uploading…</div>
                    : <><Icon name="plus" size={20} /><div className="text-11 mt-4">Add photo</div></>}
                </div>
                <input
                  type="file"
                  style={{ display: 'none' }}
                  accept="image/*"
                  disabled={uploadingImg}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file || !apiSvc) return;
                    e.target.value = '';
                    setUploadingImg(true);
                    try {
                      const url = await uploadApi.serviceImage(file);
                      await vendorApi.updateService(apiSvc.id, { images: [...imgs, url] });
                      qc.invalidateQueries({ queryKey: ['vendor-services'] });
                      qc.invalidateQueries({ queryKey: ['vendor-service', apiSvc.id] });
                    } catch {
                      showToast('Image upload failed. Please try again.', 'error');
                    } finally {
                      setUploadingImg(false);
                    }
                  }}
                />
              </label>
            </div>
          </div>
          <div className="mt-16">
            <label className="field-label">Description</label>
            <textarea className="textarea mt-8" rows={5} value={svcDesc} onChange={(e) => setSvcDesc(e.target.value)} />
          </div>
          {updateMutation.isError && <p className="mt-8 text-13" style={{ color: '#E11D48' }}>Save failed.</p>}
        </div>
      )}

      {/* ── Blocked / unavailable dates ── */}
      {tab === 'info' && apiSvc && (() => {
        const blocked: string[] = (apiSvc.blocked_dates ?? []).filter(Boolean);
        const today = new Date().toISOString().slice(0, 10);
        const saveBlocked = (dates: string[]) => {
          vendorApi.updateService(apiSvc.id, { blocked_dates: dates }).then(() => {
            qc.invalidateQueries({ queryKey: ['vendor-services'] });
            qc.invalidateQueries({ queryKey: ['vendor-service', apiSvc.id] });
          }).catch(() => showToast('Could not save dates. Please try again.', 'error'));
        };
        const addDate = () => {
          if (!newDate || blocked.includes(newDate)) { setNewDate(''); return; }
          saveBlocked([...blocked, newDate].sort());
          setNewDate('');
        };
        return (
          <div className="card card-pad mt-16">
            <label className="field-label">Blocked / unavailable dates</label>
            <p className="muted text-12 mt-4">Customers won’t be able to book these dates.</p>
            <div className="flex gap-8 mt-12" style={{ flexWrap: 'wrap' }}>
              <input type="date" className="input" style={{ width: 180 }} min={today}
                value={newDate} onChange={(e) => setNewDate(e.target.value)} />
              <button type="button" className="btn btn-primary" onClick={addDate} disabled={!newDate}>Add date</button>
            </div>
            {blocked.length > 0 ? (
              <div className="flex gap-8 mt-16" style={{ flexWrap: 'wrap' }}>
                {blocked.map((d) => (
                  <span key={d} className="chip" style={{ background: 'var(--bg-2)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    {d}
                    <button type="button" onClick={() => saveBlocked(blocked.filter((x) => x !== d))}
                      style={{ border: 0, background: 'transparent', cursor: 'pointer', display: 'grid', placeItems: 'center', color: 'var(--muted)', padding: 0 }}
                      aria-label={`Remove ${d}`}>
                      <Icon name="close" size={12} />
                    </button>
                  </span>
                ))}
              </div>
            ) : <p className="muted text-13 mt-16">No blocked dates. Customers can book any available day.</p>}
          </div>
        );
      })()}

      {/* ── Service Details (merged into Service Info tab) ── */}
      {tab === 'info' && apiSvc && (
        <div className="card card-pad mt-16">
          {isLoadingFull
            ? <div className="muted text-14 py-20" style={{ textAlign: 'center' }}>Loading service details…</div>
            : <ServiceSubdataEditor
                service={fullService ?? apiSvc}
                onSave={(data) => subdataMutation.mutate(data)}
                isSaving={subdataMutation.isPending}
              />
          }
        </div>
      )}

      {/* ── Reviews ── */}
      {tab === 'reviews' && (
        <div className="card card-pad mt-16">
          <div className="flex items-center gap-10">
            <Stars value={rating} />
            <span className="fw-700" style={{ fontSize: 18 }}>{rating}</span>
            <span className="muted text-13">({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</span>
          </div>
          <div className="mt-20" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {apiReviews.length > 0
              ? apiReviews.map((r: any, i: number) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                  <div key={i} style={{ padding: '14px 16px', background: 'var(--bg-2)', borderRadius: 12 }}>
                    <div className="flex items-center gap-10">
                      <div style={{ width: 36, height: 36, borderRadius: 999, background: 'var(--primary-50)', color: 'var(--primary-700)', display: 'grid', placeItems: 'center', fontWeight: 700, flexShrink: 0, fontSize: 15 }}>
                        {(r.user?.profile?.first_name ?? r.user?.name ?? '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="fw-600 text-14">
                          {r.user?.profile?.first_name
                            ? `${r.user.profile.first_name} ${r.user.profile.last_name ?? ''}`.trim()
                            : (r.user?.name ?? 'Customer')}
                        </div>
                        <Stars value={r.rating} size={12} />
                      </div>
                      <span className="muted text-11" style={{ marginLeft: 'auto' }}>{formatDate(r.created_at)}</span>
                    </div>
                    {r.comment && <p className="text-13 muted mt-8" style={{ marginLeft: 46 }}>{r.comment}</p>}
                  </div>
                ))
              : <div className="muted text-14 text-center" style={{ padding: '24px 0' }}>No reviews yet.</div>
            }
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Orders
// ─── Order detail drawer ─────────────────────────────────────────────────────

function labelise(key: string) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function DetailValue({ v }: { v: unknown }) {
  if (v === null || v === undefined || v === '') return <span className="muted">—</span>;
  if (Array.isArray(v)) {
    if (v.length === 0) return <span className="muted">—</span>;
    return <span>{v.join(', ')}</span>;
  }
  if (typeof v === 'object') return <span className="muted text-12">{JSON.stringify(v)}</span>;
  const str = String(v);
  // ISO datetime? format it
  if (/^\d{4}-\d{2}-\d{2}T/.test(str)) return <span>{formatDate(str.slice(0, 10))}</span>;
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return <span>{formatDate(str)}</span>;
  return <span>{str}</span>;
}

const SKIP_DETAIL_KEYS = new Set(['id', 'order_id', 'created_at', 'updated_at']);

function OrderDetailDrawer({ orderId, onClose, onApprove, onReject, approving, rejecting }: {
  orderId: number;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  approving: boolean;
  rejecting: boolean;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['vendor-order-detail', orderId],
    queryFn: () => vendorApi.order(orderId),
    staleTime: 10_000,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const o: any = data ?? {};
  const imgRaw = o.service?.images?.[0];
  const img = typeof imgRaw === 'string' ? imgRaw : (imgRaw?.url ?? '');
  const customerName = o.user?.profile?.first_name
    ? `${o.user.profile.first_name} ${o.user.profile.last_name ?? ''}`.trim()
    : (o.user?.name ?? 'Customer');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const detail: Record<string, any> | null = o.detail ?? null;

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 999 }} />
      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 420, maxWidth: '100vw',
        background: 'white', zIndex: 1000, overflowY: 'auto',
        boxShadow: '-4px 0 32px rgba(0,0,0,.15)', display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="fw-700" style={{ fontSize: 17 }}>Order #{orderId}</span>
          <button onClick={onClose} style={{ background: 'none', border: 0, cursor: 'pointer', color: 'var(--muted)', padding: 4 }}>
            <Icon name="close" size={18} />
          </button>
        </div>

        {isLoading ? (
          <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: 'var(--muted)' }}>Loading…</div>
        ) : (
          <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Service */}
            <div className="card" style={{ padding: 14, display: 'flex', gap: 14, alignItems: 'center' }}>
              {img
                ? <img src={img} alt="" style={{ width: 72, height: 56, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                : <div style={{ width: 72, height: 56, borderRadius: 8, background: 'var(--bg-3)', flexShrink: 0 }} />
              }
              <div>
                <div className="fw-700">{o.service?.title ?? '—'}</div>
                <div className="muted text-13 mt-2">{o.service?.category?.name ?? ''}</div>
              </div>
            </div>

            {/* Summary row */}
            <div className="dash-summary-3" style={{ gap: 12 }}>
              {[
                ['Customer',   customerName],
                ['Date',       formatDate(o.deliver_date ?? o.created_at)],
                ['Amount',     `€${Number(o.price).toLocaleString()}`],
              ].map(([label, value]) => (
                <div key={label} className="card" style={{ padding: '10px 14px' }}>
                  <div className="muted text-11" style={{ textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
                  <div className="fw-700 mt-4 text-13">{value}</div>
                </div>
              ))}
            </div>

            {/* Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="muted text-13">Status:</span>
              <span className={`chip ${o.status === 'approved' ? 'chip-green' : o.status === 'pending' ? 'chip-amber' : o.status === 'rejected' ? 'chip-rose' : ''}`} style={{ textTransform: 'capitalize' }}>
                {o.status}
              </span>
            </div>

            {/* Order note */}
            {o.note && (
              <div>
                <div className="muted text-12 fw-600" style={{ textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 6 }}>Customer Note</div>
                <div className="card" style={{ padding: '10px 14px', fontSize: 14, lineHeight: 1.5 }}>{o.note}</div>
              </div>
            )}

            {/* Order details */}
            {detail && (
              <div>
                <div className="muted text-12 fw-600" style={{ textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 10 }}>Booking Details</div>
                <div className="card" style={{ padding: '4px 0', overflow: 'hidden' }}>
                  {Object.entries(detail)
                    .filter(([k]) => !SKIP_DETAIL_KEYS.has(k))
                    .map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '9px 14px', borderBottom: '1px solid var(--line-2)', gap: 12 }}>
                        <span className="muted text-13" style={{ flexShrink: 0 }}>{labelise(k)}</span>
                        <span className="text-13 fw-600" style={{ textAlign: 'right' }}><DetailValue v={v} /></span>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
            {!detail && (
              <p className="muted text-13" style={{ textAlign: 'center' }}>No detailed booking data available.</p>
            )}
          </div>
        )}

        {/* Footer actions (pending only) */}
        {o.status === 'pending' && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--line)', display: 'flex', gap: 10 }}>
            <button className="btn btn-soft btn-block" style={{ color: '#059669', flex: 1 }} disabled={approving} onClick={onApprove}>
              {approving ? 'Approving…' : 'Approve'}
            </button>
            <button className="btn btn-ghost btn-block" style={{ color: '#E11D48', flex: 1 }} disabled={rejecting} onClick={onReject}>
              {rejecting ? 'Rejecting…' : 'Reject'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Vendor Orders ────────────────────────────────────────────────────────────

function VendorOrders() {
  const { showToast } = useStore();
  const [tab, setTab] = useState('pending');
  const [drawerOrderId, setDrawerOrderId] = useState<number | null>(null);
  const tabs = ['pending', 'approved', 'rejected', 'completed'];
  const qc = useQueryClient();
  const user = useAuthUser();

  const { data: ordersResult } = useQuery({
    queryKey: ['vendor-orders', tab],
    queryFn: () => vendorApi.orders({ status: tab }),
    enabled: !!user,
    staleTime: 30_000,
  });

  const apiOrders: any[] = ordersResult?.data ?? []; // eslint-disable-line @typescript-eslint/no-explicit-any

  const closeDrawer = () => setDrawerOrderId(null);

  const approveMutation = useMutation({
    mutationFn: (id: number) => vendorApi.approveOrder(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-orders'] });
      qc.invalidateQueries({ queryKey: ['vendor-order-detail', drawerOrderId] });
      showToast('Order approved!');
      closeDrawer();
    },
    onError: () => showToast('Could not approve order. Please try again.', 'error'),
  });
  const rejectMutation = useMutation({
    mutationFn: (id: number) => vendorApi.rejectOrder(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-orders'] });
      qc.invalidateQueries({ queryKey: ['vendor-order-detail', drawerOrderId] });
      showToast('Order rejected.', 'info');
      closeDrawer();
    },
    onError: () => showToast('Could not reject order. Please try again.', 'error'),
  });

  return (
    <div>
      <h1 style={{ fontSize: 32 }}>Orders</h1>
      <div className="tabs mt-20">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`tab ${tab === t ? 'tab-active' : ''}`}
            style={{ background: 'transparent', border: 0, textTransform: 'capitalize' }}>{t}</button>
        ))}
      </div>
      <div className="card mt-8" style={{ overflow: 'hidden' }}>
        <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Service</th><th className="hide-mobile">Customer</th><th className="hide-mobile">Date</th><th>Amount</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {apiOrders.map((o: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
              const imgRaw = o.service?.images?.[0];
              const img = typeof imgRaw === 'string' ? imgRaw : (imgRaw?.url ?? '');
              const customerName = o.user?.profile?.first_name
                ? `${o.user.profile.first_name} ${o.user.profile.last_name ?? ''}`
                : (o.user?.name ?? 'Customer');
              return (
                <tr key={o.id} style={{ cursor: 'pointer' }} onClick={() => setDrawerOrderId(o.id)}>
                  <td>
                    <div className="flex items-center gap-10">
                      {img ? <img src={img} alt="" style={{ width: 44, height: 36, borderRadius: 6, objectFit: 'cover' }} /> : null}
                      <span className="fw-600">{o.service?.title ?? '—'}</span>
                    </div>
                  </td>
                  <td className="muted hide-mobile">{customerName}</td>
                  <td className="muted hide-mobile">{formatDate(o.deliver_date ?? o.created_at)}</td>
                  <td className="fw-700">€{Number(o.price).toLocaleString()}</td>
                  <td><span className={`chip ${o.status === 'approved' ? 'chip-green' : o.status === 'pending' ? 'chip-amber' : o.status === 'rejected' ? 'chip-rose' : ''}`}>{o.status}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="flex gap-6" style={{ justifyContent: 'flex-end' }}>
                      {o.status === 'pending' && (<>
                        <button className="btn btn-soft btn-sm" style={{ color: '#059669' }}
                          onClick={(e) => { e.stopPropagation(); approveMutation.mutate(o.id); }}>Approve</button>
                        <button className="btn btn-ghost btn-sm" style={{ color: '#E11D48' }}
                          onClick={(e) => { e.stopPropagation(); rejectMutation.mutate(o.id); }}>Reject</button>
                      </>)}
                      <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); setDrawerOrderId(o.id); }}>View</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {apiOrders.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 30, color: 'var(--muted)' }}>No {tab} orders.</td></tr>
            )}
          </tbody>
        </table>
        </div>{/* tbl-wrap */}
      </div>

      {drawerOrderId !== null && (
        <OrderDetailDrawer
          orderId={drawerOrderId}
          onClose={closeDrawer}
          onApprove={() => approveMutation.mutate(drawerOrderId)}
          onReject={() => rejectMutation.mutate(drawerOrderId)}
          approving={approveMutation.isPending}
          rejecting={rejectMutation.isPending}
        />
      )}
    </div>
  );
}

// ─── Messages
function VendorMessages() {
  const [active, setActive] = useState<number | null>(null);
  const [msg, setMsg] = useState('');
  const qc = useQueryClient();
  const user = useAuthUser();

  const { data: apiThreads } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => conversationsApi.list(),
    enabled: !!user,
    staleTime: 30_000,
  });

  const threads: any[] = Array.isArray(apiThreads) ? apiThreads : []; // eslint-disable-line @typescript-eslint/no-explicit-any
  const activeId = active ?? threads[0]?.id ?? null;
  const thread = threads.find((t: any) => t.id === activeId) ?? threads[0] ?? null; // eslint-disable-line @typescript-eslint/no-explicit-any

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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conversation-messages', activeId] });
      setMsg('');
    },
  });

  type MsgItem = { from: 'me' | 'them'; text: string; time: string };
  const displayMessages: MsgItem[] = Array.isArray((apiMessages as any)?.data ?? apiMessages) // eslint-disable-line @typescript-eslint/no-explicit-any
    ? ((apiMessages as any)?.data ?? apiMessages as any[]).map((m: any): MsgItem => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
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
        <p className="muted text-14 mt-8">Customer messages will appear here once they contact you.</p>
      </div>
    </div>
  );

  return (
    <div>
      <h1 style={{ fontSize: 32, marginBottom: 20 }}>Messages</h1>
      <div className="card dash-msg-pane dash-msg-wrap">
        <div style={{ overflow: 'auto' }}>
          {threads.map((t: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
            const name   = t.customer?.profile?.first_name
              ? `${t.customer.profile.first_name} ${t.customer.profile.last_name ?? ''}`.trim()
              : t.customer?.name ?? t.name ?? '—';
            const avatar = t.customer?.profile?.avatar_url ?? t.avatar;
            const lastMsg = t.last_message?.body ?? t.last ?? '';
            const timeStr = t.last_message_at?.slice(11, 16) ?? '';
            const unread  = t.unread_count ?? t.unread ?? 0;
            return (
              <div key={t.id} onClick={() => setActive(t.id)}
                style={{ padding: '14px 16px', cursor: 'pointer', background: activeId === t.id ? 'var(--primary-50)' : 'white',
                  borderBottom: '1px solid var(--line-2)', display: 'flex', gap: 12, alignItems: 'center' }}>
                {avatar
                  ? <img src={avatar} alt="" style={{ width: 40, height: 40, borderRadius: 999, objectFit: 'cover' }} />
                  : <div style={{ width: 40, height: 40, borderRadius: 999, background: 'var(--primary-50)', color: 'var(--primary-700)', display: 'grid', placeItems: 'center', fontWeight: 700 }}>{name[0]}</div>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center justify-between">
                    <span className="fw-700 text-13">{name}</span>
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
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)', background: 'var(--bg-2)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="fw-700">
              {(thread as any)?.customer?.profile?.first_name // eslint-disable-line @typescript-eslint/no-explicit-any
                ? `${(thread as any).customer.profile.first_name} ${(thread as any).customer.profile.last_name ?? ''}`.trim() // eslint-disable-line @typescript-eslint/no-explicit-any
                : (thread as any)?.customer?.name ?? (thread as any)?.name ?? '—'} {/* eslint-disable-line @typescript-eslint/no-explicit-any */}
            </span>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {displayMessages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.from === 'me' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '72%', padding: '10px 14px', borderRadius: m.from === 'me' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: m.from === 'me' ? 'var(--primary)' : 'var(--bg-2)', color: m.from === 'me' ? 'white' : 'var(--ink)', fontSize: 14 }}>
                  {m.text}
                  {'time' in m && m.time && <div style={{ fontSize: 10, opacity: .7, marginTop: 4 }}>{m.time}</div>}
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--line)', display: 'flex', gap: 10 }}>
            <input className="input" style={{ flex: 1 }} placeholder="Type your message…" value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && msg.trim()) sendMutation.mutate(msg.trim()); }} />
            <button className="btn btn-primary" style={{ padding: '0 18px' }}
              onClick={() => { if (msg.trim()) sendMutation.mutate(msg.trim()); }}>
              <Icon name="send" size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Billing
function VendorBilling() {
  const user = useAuthUser();
  const { showToast } = useStore();
  const qc = useQueryClient();
  const [confirmCancel, setConfirmCancel] = useState(false);

  const { data: billing, isLoading: billingLoading } = useQuery({
    queryKey: ['vendor-billing'],
    queryFn: () => vendorApi.billingInfo(),
    enabled: !!user,
    staleTime: 0,
  });

  const portalMutation = useMutation({
    mutationFn: () => vendorApi.billingPortal(),
    onSuccess: (data) => { window.location.href = data.url; },
    onError: () => showToast('Could not open billing portal. Please try again.', 'error'),
  });

  const cancelMutation = useMutation({
    mutationFn: () => vendorApi.cancelSubscription(),
    onSuccess: () => {
      setConfirmCancel(false);
      qc.invalidateQueries({ queryKey: ['vendor-billing'] });
      showToast('Subscription cancelled.', 'info');
    },
    onError: () => showToast('Could not cancel subscription. Please try again.', 'error'),
  });

  // Derive display values — fall back to DB plan when Stripe data unavailable
  const sub = billing?.subscription;
  const planLabel = billing?.plan === '12month' ? 'Annual' : billing?.plan === '3month' ? '3-Month' : 'Professional';
  const planStatus = billing?.status ?? 'active';
  const amount = sub?.amount ?? (billing?.plan === '12month' ? 129 : 49);
  const currency = sub?.currency ?? 'EUR';
  const interval = sub?.interval ?? 'month';
  const renewsAt = sub?.current_period_end
    ? new Date(sub.current_period_end * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;
  const cancelAtEnd = sub?.cancel_at_period_end ?? false;
  const isCancelled = planStatus === 'cancelled';
  const invoices: any[] = billing?.invoices ?? []; // eslint-disable-line @typescript-eslint/no-explicit-any

  return (
    <div>
      <h1 style={{ fontSize: 32 }}>Billing</h1>

      {/* Cancel confirmation modal */}
      {confirmCancel && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ maxWidth: 400, width: '90%', padding: 28 }}>
            <h2 style={{ fontSize: 18, marginBottom: 10 }}>Cancel your plan?</h2>
            <p className="muted text-14" style={{ marginBottom: 20 }}>Your subscription will be cancelled immediately and your service listings will be deactivated. This cannot be undone.</p>
            <div className="flex gap-10">
              <button className="btn btn-ghost" onClick={() => setConfirmCancel(false)} disabled={cancelMutation.isPending}>Keep plan</button>
              <button className="btn" style={{ background: '#E11D48', color: 'white', borderColor: '#E11D48' }}
                onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending}>
                {cancelMutation.isPending ? 'Cancelling…' : 'Yes, cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card mt-20" style={{ background: isCancelled ? '#64748B' : 'linear-gradient(135deg, var(--primary), var(--primary-700))', color: 'white', padding: 28, borderRadius: 20 }}>
        {billingLoading ? (
          <div style={{ opacity: .7, fontSize: 14 }}>Loading subscription…</div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <div style={{ opacity: .8, fontSize: 13, fontWeight: 600 }}>
                  {isCancelled ? 'Cancelled' : cancelAtEnd ? 'Cancels at period end' : 'Current Plan'}
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>{planLabel}</div>
                {renewsAt && !isCancelled && (
                  <div style={{ opacity: .75, fontSize: 12, marginTop: 4 }}>
                    {cancelAtEnd ? `Access until ${renewsAt}` : `Renews ${renewsAt}`}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 36, fontWeight: 700 }}>{currency === 'EUR' ? '€' : currency}{amount}</div>
                <div style={{ opacity: .8, fontSize: 13 }}>/ {interval}</div>
              </div>
            </div>
            {!isCancelled && (
              <div className="flex gap-10 mt-20" style={{ flexWrap: 'wrap' }}>
                {['Unlimited listings', 'Priority support', 'Analytics dashboard', 'Featured placement'].map((f) => (
                  <span key={f} style={{ background: 'rgba(255,255,255,.2)', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>{f}</span>
                ))}
              </div>
            )}
            <div className="flex gap-10 mt-20">
              {!isCancelled && (
                <>
                  <button className="btn btn-sm" style={{ background: 'white', color: 'var(--primary)', borderRadius: 999 }}
                    onClick={() => portalMutation.mutate()} disabled={portalMutation.isPending}>
                    {portalMutation.isPending ? 'Opening…' : 'Manage subscription'}
                  </button>
                  {!cancelAtEnd && (
                    <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,.2)', color: 'white', borderRadius: 999 }}
                      onClick={() => setConfirmCancel(true)}>
                      Cancel plan
                    </button>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>

      <div className="card mt-20" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', fontWeight: 700 }}>Recent invoices</div>
        <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>Invoice</th><th className="hide-mobile">Date</th><th>Amount</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {billingLoading && (
              <tr><td colSpan={5} className="muted text-13" style={{ padding: '16px 18px' }}>Loading invoices…</td></tr>
            )}
            {!billingLoading && invoices.length === 0 && (
              <tr><td colSpan={5} className="muted text-13" style={{ padding: '16px 18px' }}>No invoices yet.</td></tr>
            )}
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="fw-600">{inv.number ?? inv.id}</td>
                <td className="muted hide-mobile">
                  {new Date(inv.date * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td>{inv.currency === 'EUR' ? '€' : inv.currency}{Number(inv.amount).toFixed(2)}</td>
                <td><span className={`chip ${inv.status === 'paid' ? 'chip-green' : 'chip-amber'}`} style={{ textTransform: 'capitalize' }}>{inv.status}</span></td>
                <td>
                  {inv.pdf
                    ? <a href={inv.pdf} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm"><Icon name="download" size={12} /></a>
                    : <button className="btn btn-ghost btn-sm" disabled><Icon name="download" size={12} /></button>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>{/* tbl-wrap */}
      </div>
    </div>
  );
}

// ─── Settings
function VendorSettings() {
  const user = useAuthUser();
  const { logout } = useStore();
  const qc = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['vendor-profile'],
    queryFn: () => vendorApi.profile(),
    enabled: !!user,
    staleTime: 60_000,
  });
  const vp = profile?.vendor_profile ?? profile?.vendorProfile ?? profile;

  const [bizName, setBizName]   = useState('');
  const [bizDesc, setBizDesc]   = useState('');
  const [bizLoc,  setBizLoc]    = useState('');
  const [bizSaved, setBizSaved] = useState(false);

  const [cfn, setCfn]           = useState('');
  const [cln, setCln]           = useState('');
  const [ctitle, setCtitle]     = useState('');
  const [conSaved, setConSaved] = useState(false);

  const [curPwd,  setCurPwd]  = useState('');
  const [newPwd,  setNewPwd]  = useState('');
  const [confPwd, setConfPwd] = useState('');
  const [pwdMsg, setPwdMsg]   = useState('');

  const [avatarUrl, setAvatarUrl]       = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarSaved, setAvatarSaved]   = useState(false);
  const [avatarError, setAvatarError]   = useState('');

  useEffect(() => {
    if (!vp) return;
    setBizName(vp.business_name ?? '');
    setBizDesc(vp.business_description ?? '');
    setBizLoc(vp.location ?? '');
    setCfn(vp.contact_first_name ?? '');
    setCln(vp.contact_last_name ?? '');
    setCtitle(vp.contact_title ?? '');
    setAvatarUrl(vp.avatar_url ?? '');
  }, [vp]);

  const avatarMutation = useMutation({
    mutationFn: () => vendorApi.updateProfile({ avatar_url: avatarUrl }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-profile'] });
      setAvatarSaved(true);
      setTimeout(() => setAvatarSaved(false), 2500);
    },
    onError: () => setAvatarError('Failed to save profile photo.'),
  });

  const handleAvatarFile = async (file: File) => {
    setAvatarError('');
    setAvatarUploading(true);
    try {
      const url = await uploadApi.avatar(file);
      setAvatarUrl(url);
      // auto-save immediately after upload
      await vendorApi.updateProfile({ avatar_url: url });
      qc.invalidateQueries({ queryKey: ['vendor-profile'] });
      setAvatarSaved(true);
      setTimeout(() => setAvatarSaved(false), 2500);
    } catch {
      setAvatarError('Upload failed. Please try a smaller image.');
    } finally {
      setAvatarUploading(false);
    }
  };

  const bizMutation = useMutation({
    mutationFn: () => vendorApi.updateProfile({ business_name: bizName, business_description: bizDesc, location: bizLoc }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vendor-profile'] }); setBizSaved(true); setTimeout(() => setBizSaved(false), 2500); },
  });

  const conMutation = useMutation({
    mutationFn: () => vendorApi.updateProfile({ contact_first_name: cfn, contact_last_name: cln, contact_title: ctitle }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vendor-profile'] }); setConSaved(true); setTimeout(() => setConSaved(false), 2500); },
  });

  const pwdMutation = useMutation({
    mutationFn: () => vendorApi.updatePassword({ current_password: curPwd, password: newPwd, password_confirmation: confPwd }),
    onSuccess: () => { setPwdMsg('Password updated!'); setCurPwd(''); setNewPwd(''); setConfPwd(''); },
    onError: (e: any) => setPwdMsg(e?.response?.data?.message ?? 'Password update failed.'), // eslint-disable-line @typescript-eslint/no-explicit-any
  });

  const delMutation = useMutation({
    mutationFn: () => vendorApi.deleteAccount(),
    onSuccess: async () => { await logout(); router.visit('/'); },
  });

  return (
    <div>
      <h1 style={{ fontSize: 32 }}>Settings</h1>
      <div className="grid mt-20 dash-grid-2" style={{ gap: 20 }}>
        {/* Profile Photo */}
        <div className="card card-pad" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ fontSize: 17 }}>Profile Photo</h3>
          <p className="muted text-13 mt-4">This photo appears on your public listing and in search results.</p>
          <div className="flex items-center gap-20 mt-16" style={{ flexWrap: 'wrap' }}>
            {/* Avatar preview */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile"
                  style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)', display: 'block' }} />
              ) : (
                <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'var(--bg-3)', border: '3px solid var(--line)', display: 'grid', placeItems: 'center' }}>
                  <Icon name="user" size={36} color="var(--muted)" />
                </div>
              )}
              {avatarUploading && (
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', display: 'grid', placeItems: 'center' }}>
                  <span style={{ color: 'white', fontSize: 12 }}>…</span>
                </div>
              )}
            </div>
            {/* Upload controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label className="btn btn-primary" style={{ cursor: avatarUploading ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Icon name="plus" size={14} color="white" />
                {avatarUploading ? 'Uploading…' : 'Upload photo'}
                <input type="file" accept="image/*" style={{ display: 'none' }} disabled={avatarUploading}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) { e.target.value = ''; handleAvatarFile(f); } }} />
              </label>
              {avatarUrl && (
                <button type="button" className="btn btn-ghost btn-sm" style={{ color: '#E11D48' }}
                  onClick={() => { setAvatarUrl(''); avatarMutation.mutate(); }}>
                  Remove photo
                </button>
              )}
              <span className="muted text-12">JPG, PNG or WebP · max 5 MB</span>
            </div>
            {/* Status messages */}
            <div style={{ flex: 1 }}>
              {avatarSaved && <p className="text-13 fw-600" style={{ color: '#059669' }}>✓ Profile photo saved</p>}
              {avatarError && <p className="text-13" style={{ color: '#E11D48' }}>{avatarError}</p>}
            </div>
          </div>
        </div>

        {/* Business Profile */}
        <div className="card card-pad">
          <h3 style={{ fontSize: 17 }}>Business Profile</h3>
          <div className="mt-16" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div><label className="field-label">Business name</label><input className="input mt-4" value={bizName} onChange={(e) => setBizName(e.target.value)} /></div>
            <div><label className="field-label">Business description</label><textarea className="textarea mt-4" rows={3} value={bizDesc} onChange={(e) => setBizDesc(e.target.value)} /></div>
            <div><label className="field-label">Location</label><input className="input mt-4" value={bizLoc} onChange={(e) => setBizLoc(e.target.value)} /></div>
          </div>
          <button className="btn btn-primary btn-block mt-16" onClick={() => bizMutation.mutate()} disabled={bizMutation.isPending}>
            {bizSaved ? '✓ Saved' : bizMutation.isPending ? 'Saving…' : 'Save changes'}
          </button>
          {bizMutation.isError && <p className="mt-8 text-13" style={{ color: '#E11D48' }}>Save failed.</p>}
        </div>

        {/* Contact */}
        <div className="card card-pad">
          <h3 style={{ fontSize: 17 }}>Contact</h3>
          <div className="mt-16" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div><label className="field-label">First name</label><input className="input mt-4" value={cfn} onChange={(e) => setCfn(e.target.value)} /></div>
            <div><label className="field-label">Last name</label><input className="input mt-4" value={cln} onChange={(e) => setCln(e.target.value)} /></div>
            <div><label className="field-label">Title / Role</label><input className="input mt-4" value={ctitle} onChange={(e) => setCtitle(e.target.value)} /></div>
            <div><label className="field-label">Email</label><input className="input mt-4" value={user?.email ?? ''} disabled style={{ opacity: .6 }} /></div>
          </div>
          <button className="btn btn-primary btn-block mt-16" onClick={() => conMutation.mutate()} disabled={conMutation.isPending}>
            {conSaved ? '✓ Saved' : conMutation.isPending ? 'Saving…' : 'Save changes'}
          </button>
          {conMutation.isError && <p className="mt-8 text-13" style={{ color: '#E11D48' }}>Save failed.</p>}
        </div>

        {/* Password */}
        <div className="card card-pad">
          <h3 style={{ fontSize: 17 }}>Change Password</h3>
          <div className="mt-16" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div><label className="field-label">Current password</label><input type="password" className="input mt-4" value={curPwd} onChange={(e) => setCurPwd(e.target.value)} /></div>
            <div><label className="field-label">New password</label><input type="password" className="input mt-4" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} /></div>
            <div><label className="field-label">Confirm new password</label><input type="password" className="input mt-4" value={confPwd} onChange={(e) => setConfPwd(e.target.value)} /></div>
          </div>
          {pwdMsg && <p className="mt-8 text-13" style={{ color: pwdMsg.startsWith('Password updated') ? '#059669' : '#E11D48' }}>{pwdMsg}</p>}
          <button className="btn btn-primary btn-block mt-16" onClick={() => pwdMutation.mutate()} disabled={pwdMutation.isPending || !curPwd || !newPwd}>
            {pwdMutation.isPending ? 'Updating…' : 'Update password'}
          </button>
        </div>

        {/* Danger zone */}
        <div className="card card-pad" style={{ border: '1px solid #FCA5A5' }}>
          <h3 style={{ fontSize: 17, color: '#E11D48' }}>Danger Zone</h3>
          <p className="muted text-13 mt-8">Permanently delete your account and all associated data. This action cannot be undone.</p>
          <button className="btn mt-16" style={{ background: '#FEE2E2', color: '#E11D48', border: 0 }}
            onClick={() => { if (confirm('Delete your account permanently?')) delMutation.mutate(); }}
            disabled={delMutation.isPending}>
            {delMutation.isPending ? 'Deleting…' : 'Delete account'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface VendorProps {
  sub?: string;
}

export default function VendorDashboard({ sub: subProp }: VendorProps) {
  const pageProps = usePage().props as VendorProps;
  const sub = subProp ?? pageProps.sub ?? '';
  const active = sub;
  const user = useAuthUser();

  useEffect(() => {
    if (!user) router.visit('/auth', { replace: true });
  }, [user]);

  useEffect(() => {
    document.title = 'Vendor Dashboard | Wedbi';
    return () => { document.title = 'Wedbi'; };
  }, []);

  if (!user) return null;

  return (
    <div className="dash-shell">
      <VendorSidebar active={active} />
      <main className="dash-main">
        {active === ''         && <VendorHome />}
        {active === 'service'  && <VendorService />}
        {active === 'orders'   && <VendorOrders />}
        {active === 'messages' && <VendorMessages />}
        {active === 'billing'  && <VendorBilling />}
        {active === 'settings' && <VendorSettings />}
      </main>
    </div>
  );
}
