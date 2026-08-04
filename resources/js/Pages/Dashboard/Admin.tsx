import { useState, useEffect, useRef } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Icon from '../../components/shared/Icon';
import Logo from '../../components/shared/Logo';
import { useStore, useAuthUser } from '../../store';
import { CATEGORIES } from '../../lib/data';
import { adminApi, profileApi, uploadApi } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import VendorSetupPanel from '../../components/admin/VendorSetupPanel';

// ─── Stat card
function Stat({ tone, icon, label, value }: { tone: string; icon: string; label: string; value: number }) {
  const bg: Record<string, string> = { amber: '#FFF7E6', green: '#E6F7F0', neutral: '#F5F5F5', rose: '#FFF0F0', blue: '#E6F0FF' };
  const fg: Record<string, string> = { amber: '#D97706', green: '#059669', neutral: '#6B7280', rose: '#E11D48', blue: '#2563EB' };
  return (
    <div className="card card-pad" style={{ background: bg[tone] || 'white' }}>
      <div className="flex items-center justify-between">
        <div style={{ color: fg[tone] }}><Icon name={icon} size={20} /></div>
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, marginTop: 12 }}>{value}</div>
      <div className="muted text-13 mt-4">{label}</div>
    </div>
  );
}

// ─── Sidebar
function AdminSidebar({ active }: { active: string }) {
  const { logout } = useStore();
  const [open, setOpen] = useState(false);
  const items = [
    { id: 'dashboard', href: '/dashboard/admin',           label: 'Dashboard', icon: 'grid' },
    { id: 'services',  href: '/dashboard/admin/services',  label: 'Services',  icon: 'services' },
    { id: 'vendors',   href: '/dashboard/admin/vendors',   label: 'Vendors',   icon: 'user' },
    { id: 'blogs',     href: '/dashboard/admin/blogs',     label: 'Blogs',     icon: 'blog' },
    { id: 'users',     href: '/dashboard/admin/users',     label: 'Users',     icon: 'bookings' },
    { id: 'orders',    href: '/dashboard/admin/orders',    label: 'Orders',    icon: 'cart' },
    { id: 'feedback',  href: '/dashboard/admin/feedback',  label: 'Feedback',  icon: 'starOutline' },
    { id: 'settings',  href: '/dashboard/admin/settings',  label: 'Settings',  icon: 'settings' },
  ];
  return (
    <aside className={`dash-side${open ? ' open' : ''}`} style={{ background: 'var(--primary)' }}>
      <div className="dash-side-top">
        <div className="brand" style={{ color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Link href="/" style={{ textDecoration: 'none' }}><Logo light compact /></Link>
          <span style={{ background: 'rgba(255,255,255,.22)', color: 'white', padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>ADMIN</span>
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
          </Link>
        ))}
      </nav>
      <div className="dash-side-foot" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, color: 'white', fontWeight: 500, fontSize: 14, background: 'rgba(255,255,255,.1)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
          <Icon name="home" size={18} color="white" /> Back to site
        </Link>
        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, color: 'white', fontWeight: 500, fontSize: 14, background: 'rgba(255,255,255,.08)', border: 0, cursor: 'pointer', width: '100%', whiteSpace: 'nowrap' }}>
          <Icon name="logout" size={18} color="white" /> Sign out
        </button>
      </div>
    </aside>
  );
}

// ─── Shimmer skeleton
function SkRow() {
  const sk = { height: 14, borderRadius: 6, background: 'linear-gradient(90deg,var(--bg-3) 25%,var(--bg-2) 50%,var(--bg-3) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' } as const;
  return (
    <tr>
      <td><input type="checkbox" disabled /></td>
      <td><div className="flex items-center gap-10"><div style={{ ...sk, width: 32, height: 32, borderRadius: 999 }} /><div style={{ ...sk, width: 120 }} /></div></td>
      <td><div style={{ ...sk, width: 60 }} /></td>
      <td><div style={{ ...sk, width: 80 }} /></td>
      <td><div style={{ ...sk, width: 50 }} /></td>
      <td><div style={{ ...sk, width: 70, marginLeft: 'auto' }} /></td>
    </tr>
  );
}

// Basic email format check for the create-user form
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Users
function AdminUsers() {
  const [q, setQ] = useState('');
  const [role, setRole] = useState('all');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();
  const user = useAuthUser();
  const showToast = useStore((s) => s.showToast);

  // Debounce search
  const [debouncedQ, setDebouncedQ] = useState('');
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedQ(q); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [q]);
  useEffect(() => { setPage(1); }, [role]);

  const { data: apiResult, isLoading } = useQuery({
    queryKey: ['admin-users', debouncedQ, role, page],
    queryFn: () => adminApi.users({
      ...(debouncedQ && { search: debouncedQ }),
      ...(role !== 'all' && { role }),
      page,
    }),
    enabled: !!user,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

  const banMutation   = useMutation({ mutationFn: (id: number) => adminApi.ban(id),   onSuccess: (_d, id) => { qc.invalidateQueries({ queryKey: ['admin-users'] }); setConfirmBanId(null); setEditUser((u: any) => u && u.id === id ? { ...u, banned_at: new Date().toISOString() } : u); } });
  const unbanMutation = useMutation({ mutationFn: (id: number) => adminApi.unban(id), onSuccess: (_d, id) => { qc.invalidateQueries({ queryKey: ['admin-users'] }); setConfirmUnbanId(null); setEditUser((u: any) => u && u.id === id ? { ...u, banned_at: null } : u); } });
  const deleteMutation = useMutation({ mutationFn: (id: number) => adminApi.deleteUser(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); setConfirmDeleteId(null); setEditUser(null); } });
  const verifyEmailMutation = useMutation({
    mutationFn: (id: number) => adminApi.verifyEmail(id),
    onSuccess: (res, id) => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      setEditUser((u: any) => u && u.id === id ? { ...u, email_verified_at: res.email_verified_at } : u);
      showToast('Email verified.', 'success');
    },
    onError: () => showToast('Failed to verify email.', 'error'),
  });
  const activatePlanMutation = useMutation({
    mutationFn: ({ id, plan }: { id: number; plan: string }) => adminApi.activatePlan(id, plan),
    onSuccess: (res, { id }) => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      setEditUser((u: any) => u && u.id === id ? { ...u, vendor_plan: res.vendor_plan, vendor_subscription_status: res.vendor_subscription_status } : u);
      showToast('Plan activated.', 'success');
    },
    onError: () => showToast('Failed to activate plan.', 'error'),
  });
  const changeRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) => adminApi.changeRole(id, role),
    onSuccess: (res, { id }) => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      setEditUser((u: any) => u && u.id === id ? { ...u, role: res.role } : u);
      showToast('Role updated.', 'success');
    },
    onError: () => showToast('Failed to change role. You cannot change your own role.', 'error'),
  });
  const inviteMutation = useMutation({
    mutationFn: (d: { name: string; email: string; role: string }) => adminApi.invite(d),
    onSuccess: (res) => { qc.invalidateQueries({ queryKey: ['admin-users'] }); setInviteResult(res); },
    onError: () => setInviteErr('This email is already in use or is invalid.'),
  });
  const createUserMutation = useMutation({
    mutationFn: (d: { name: string; email: string; role: string; password: string }) => adminApi.createUser(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); setShowCreate(false); showToast('User created.', 'success'); },
    onError: () => setCreateErr('Could not create user. Check the email is unique and the password is at least 8 characters.'),
  });

  const list: any[] = apiResult?.data ?? []; // eslint-disable-line @typescript-eslint/no-explicit-any
  const total: number  = apiResult?.total ?? 0;
  const lastPage: number = apiResult?.last_page ?? 1;

  const stats = {
    total,
    active:    apiResult?.active_count    ?? list.filter((u: any) => !u.banned_at).length,
    customers: apiResult?.customer_count  ?? list.filter((u: any) => u.role === 'customer').length,
    vendors:   apiResult?.vendor_count    ?? list.filter((u: any) => u.role === 'vendor').length,
  };

  const roleChipStyle = (r: string) => {
    if (r === 'vendor') return { background: 'var(--primary-50)', color: 'var(--primary-700)' };
    if (r === 'admin')  return { background: '#EEF2FF', color: '#4338CA' };
    return { background: 'var(--bg-3)', color: 'var(--ink-2)' };
  };

  // Ban / Unban / Delete confirmation
  const [confirmBanId, setConfirmBanId]       = useState<number | null>(null);
  const [confirmUnbanId, setConfirmUnbanId]   = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const confirmBanUser    = confirmBanId    != null ? list.find((u: any) => u.id === confirmBanId)    : null;
  const confirmUnbanUser  = confirmUnbanId  != null ? list.find((u: any) => u.id === confirmUnbanId)  : null;
  const confirmDeleteUser = confirmDeleteId != null ? list.find((u: any) => u.id === confirmDeleteId) : null;

  // Edit modal
  const [editUser, setEditUser] = useState<any | null>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [planChoice, setPlanChoice] = useState('3month');
  const [roleChoice, setRoleChoice] = useState('');

  // Invite modal
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'customer' });
  const [inviteErr, setInviteErr] = useState('');
  const [inviteResult, setInviteResult] = useState<any | null>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  // Create user modal
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', role: 'customer', password: '' });
  const [createErr, setCreateErr] = useState('');
  const [showCreatePw, setShowCreatePw] = useState(false);

  const pageNumbers = (() => {
    if (lastPage <= 7) return Array.from({ length: lastPage }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, -1, lastPage];
    if (page >= lastPage - 3) return [1, -1, lastPage - 4, lastPage - 3, lastPage - 2, lastPage - 1, lastPage];
    return [1, -1, page - 1, page, page + 1, -2, lastPage];
  })();

  return (
    <div>
      <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 32 }}>Users</h1>
        <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
          <button className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => { setInviteForm({ name: '', email: '', role: 'customer' }); setInviteErr(''); setInviteResult(null); setShowInvite(true); }}>
            <Icon name="plus" size={14} /> Invite user
          </button>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => { setCreateForm({ name: '', email: '', role: 'customer', password: '' }); setCreateErr(''); setShowCreatePw(false); setShowCreate(true); }}>
            <Icon name="plus" size={14} /> Create user
          </button>
        </div>
      </div>

      <div className="grid r-grid-4 mt-20" style={{ gap: 16 }}>
        <Stat tone="neutral" icon="bookings" label="Total users"  value={stats.total} />
        <Stat tone="green"   icon="check"    label="Active"       value={stats.active} />
        <Stat tone="blue"    icon="user"     label="Customers"    value={stats.customers} />
        <Stat tone="amber"   icon="services" label="Vendors"      value={stats.vendors} />
      </div>

      <div className="card mt-20">
        <div className="flex items-center gap-12" style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', flexWrap: 'wrap' }}>
          <div className="input" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', maxWidth: 280, flex: 1 }}>
            <Icon name="search" size={16} color="var(--muted)" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email"
              style={{ border: 0, outline: 'none', width: '100%', background: 'transparent', fontSize: 13 }} />
          </div>
          <div className="flex gap-6">
            {(['all', 'customer', 'vendor', 'admin'] as const).map((r) => (
              <button key={r} onClick={() => setRole(r)}
                className={`chip chip-selectable ${role === r ? 'chip-selected' : ''}`}
                style={{ textTransform: 'capitalize' }}>
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th className="hide-mobile"><input type="checkbox" /></th>
              <th>Name</th>
              <th className="hide-mobile">Role</th>
              <th className="hide-mobile">Joined</th>
              <th className="hide-mobile">Status</th>
              <th className="tbl-actions" style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [1,2,3,4,5].map((i) => <SkRow key={i} />)
            ) : list.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>No users found.</td></tr>
            ) : list.map((u: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
              const isBanned = !!u.banned_at;
              const name = u.profile?.first_name ? `${u.profile.first_name} ${u.profile.last_name ?? ''}`.trim() : (u.name ?? u.email ?? '?');
              const joined = formatDate(u.created_at);
              return (
                <tr key={u.id} style={isBanned ? { background: 'rgba(225,29,72,0.04)' } : {}}>
                  <td className="hide-mobile"><input type="checkbox" /></td>
                  <td className="tbl-name-cell">
                    <div className="flex items-center gap-10">
                      {/* Avatar — grey + ban badge when banned */}
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 999, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 14,
                          background: isBanned ? '#F3F4F6' : 'var(--primary-50)',
                          color:      isBanned ? '#9CA3AF' : 'var(--primary-700)',
                          opacity:    isBanned ? 0.8 : 1 }}>
                          {name[0]?.toUpperCase()}
                        </div>
                        {isBanned && (
                          <span style={{ position: 'absolute', bottom: -2, right: -2, width: 14, height: 14, borderRadius: 999, background: '#E11D48', border: '2px solid white', display: 'grid', placeItems: 'center' }}>
                            <svg width="6" height="6" viewBox="0 0 8 8" fill="none"><path d="M1 1l6 6M7 1L1 7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                          </span>
                        )}
                      </div>
                      <div style={{ opacity: isBanned ? 0.6 : 1 }}>
                        <div className="fw-600 text-14" style={isBanned ? { textDecoration: 'line-through', color: 'var(--muted)' } : {}}>{name}</div>
                        <div className="muted text-12">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="hide-mobile">
                    <span className="chip" style={{ ...roleChipStyle(u.role), textTransform: 'capitalize', fontSize: 11, opacity: isBanned ? 0.5 : 1 }}>{u.role}</span>
                  </td>
                  <td className="muted text-13 hide-mobile" style={{ opacity: isBanned ? 0.6 : 1 }}>{joined}</td>
                  <td className="hide-mobile">
                    <span className="chip" style={!isBanned
                      ? { background: '#E6F7F0', color: '#059669', fontSize: 11 }
                      : { background: '#FFF0F0', color: '#E11D48', fontSize: 11, fontWeight: 700 }}>
                      {isBanned ? 'ban' : 'active'}
                    </span>
                  </td>
                  <td className="tbl-actions" style={{ textAlign: 'right' }}>
                    <div className="flex gap-6" style={{ justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost btn-sm" title="Edit user"
                        onClick={() => { setEditUser(u); setPlanChoice(u.vendor_plan ?? '3month'); setRoleChoice(u.role); }}>
                        <Icon name="pencil" size={14} /><span className="hide-mobile" style={{ marginLeft: 4 }}>Edit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>{/* tbl-wrap */}

        <div className="flex items-center justify-between" style={{ padding: '12px 18px', borderTop: '1px solid var(--border)' }}>
          <span className="muted text-13">Showing {list.length} of {total} users</span>
          {lastPage > 1 && (
            <div className="flex gap-4">
              <button className="btn btn-ghost btn-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>‹ Prev</button>
              {pageNumbers.map((n, i) =>
                n < 0 ? (
                  <span key={n + '_' + i} style={{ padding: '0 4px', color: 'var(--muted)', alignSelf: 'center' }}>…</span>
                ) : (
                  <button key={n} className="btn btn-sm"
                    style={n === page
                      ? { background: 'var(--primary)', color: '#fff', border: 'none', minWidth: 32 }
                      : { background: 'transparent', border: '1px solid var(--border)', minWidth: 32 }}
                    onClick={() => setPage(n)}>{n}</button>
                )
              )}
              <button className="btn btn-ghost btn-sm" onClick={() => setPage((p) => Math.min(lastPage, p + 1))} disabled={page === lastPage}>Next ›</button>
            </div>
          )}
        </div>
      </div>

      {/* ── Ban confirmation modal ── */}
      {confirmBanId != null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: 420, padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Ban user?</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>
              Are you sure you want to ban <strong>{confirmBanUser?.name ?? confirmBanUser?.email ?? 'this user'}</strong>? They will be immediately locked out.
            </p>
            <div className="flex gap-10" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setConfirmBanId(null)} disabled={banMutation.isPending}>Cancel</button>
              <button className="btn btn-primary" style={{ background: '#E11D48', borderColor: '#E11D48' }}
                onClick={() => banMutation.mutate(confirmBanId!)}
                disabled={banMutation.isPending}>
                {banMutation.isPending ? 'Banning…' : 'Ban user'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Unban confirmation modal ── */}
      {confirmUnbanId != null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: 420, padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Unban user?</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>
              This will restore access for <strong>{confirmUnbanUser?.name ?? confirmUnbanUser?.email ?? 'this user'}</strong>. They will be able to log in immediately.
            </p>
            <div className="flex gap-10" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setConfirmUnbanId(null)} disabled={unbanMutation.isPending}>Cancel</button>
              <button className="btn btn-primary"
                onClick={() => unbanMutation.mutate(confirmUnbanId!)}
                disabled={unbanMutation.isPending}>
                {unbanMutation.isPending ? 'Unbanning…' : 'Unban user'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirmation modal ── */}
      {confirmDeleteId != null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: 420, padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Delete user?</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>
              Permanently delete <strong>{confirmDeleteUser?.name ?? confirmDeleteUser?.email ?? 'this user'}</strong>? Their account, profile, and all associated data will be removed. <span style={{ color: '#E11D48', fontWeight: 600 }}>This cannot be undone.</span>
            </p>
            <div className="flex gap-10" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setConfirmDeleteId(null)} disabled={deleteMutation.isPending}>Cancel</button>
              <button className="btn btn-primary" style={{ background: '#E11D48', borderColor: '#E11D48' }}
                onClick={() => deleteMutation.mutate(confirmDeleteId!)}
                disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? 'Deleting…' : 'Delete user'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit user modal ── */}
      {editUser != null && (() => {
        const u = editUser;
        const isBanned = !!u.banned_at;
        const isVerified = !!u.email_verified_at;
        const isSelf = u.id === user?.id;
        const name = u.profile?.first_name ? `${u.profile.first_name} ${u.profile.last_name ?? ''}`.trim() : (u.name ?? u.email ?? '?');
        const selectStyle: React.CSSProperties = { padding: '8px 12px', fontSize: 13, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-2)', outline: 'none', flex: 1 };
        const sectionLabel: React.CSSProperties = { fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--muted)', marginBottom: 8 };
        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
            onClick={() => setEditUser(null)}>
            <div className="card" style={{ width: 480, maxHeight: '90vh', overflowY: 'auto', padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}
              onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center gap-14">
                <div style={{ width: 52, height: 52, borderRadius: 999, background: 'var(--primary-50)', color: 'var(--primary-700)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 22, flexShrink: 0 }}>
                  {name[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 17 }}>{name}</div>
                  <div className="muted text-13">{u.email}</div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditUser(null)} style={{ fontSize: 18, lineHeight: 1 }}>×</button>
              </div>

              {/* Details grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px' }}>
                {[
                  ['Role',    <span className="chip" style={{ ...roleChipStyle(u.role), textTransform: 'capitalize', fontSize: 11 }}>{u.role}</span>],
                  ['Status',  <span className="chip" style={!isBanned ? { background: '#E6F7F0', color: '#059669', fontSize: 11 } : { background: '#FFF0F0', color: '#E11D48', fontSize: 11 }}>{isBanned ? 'Banned' : 'Active'}</span>],
                  ['Joined',  <span className="text-13">{formatDate(u.created_at)}</span>],
                  ['User ID', <span className="muted text-13">#{u.id}</span>],
                ].map(([label, val], i) => (
                  <div key={i}>
                    <div className="muted text-12" style={{ marginBottom: 3 }}>{label as string}</div>
                    <div>{val as React.ReactNode}</div>
                  </div>
                ))}
              </div>

              {/* Email verification */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <div style={sectionLabel}>Email verification</div>
                <div className="flex items-center justify-between gap-10">
                  <span className="chip" style={isVerified
                    ? { background: '#E6F7F0', color: '#059669', fontSize: 11 }
                    : { background: '#FFF7E6', color: '#D97706', fontSize: 11 }}>
                    {isVerified ? 'Verified' : 'Not verified'}
                  </span>
                  {!isVerified && (
                    <button className="btn btn-primary btn-sm"
                      onClick={() => verifyEmailMutation.mutate(u.id)}
                      disabled={verifyEmailMutation.isPending}>
                      {verifyEmailMutation.isPending ? 'Verifying…' : 'Verify email'}
                    </button>
                  )}
                </div>
              </div>

              {/* Plan activation (vendors only) */}
              {u.role === 'vendor' && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                  <div style={sectionLabel}>Subscription plan</div>
                  <div className="flex items-center gap-10" style={{ marginBottom: 10 }}>
                    <span className="muted text-13">Current:</span>
                    <span className="chip" style={u.vendor_subscription_status === 'active'
                      ? { background: '#E6F7F0', color: '#059669', fontSize: 11 }
                      : { background: 'var(--bg-3)', color: 'var(--ink-2)', fontSize: 11 }}>
                      {u.vendor_subscription_status ?? 'none'}{u.vendor_plan ? ` · ${u.vendor_plan}` : ''}
                    </span>
                  </div>
                  <div className="flex gap-10">
                    <select style={selectStyle} value={planChoice} onChange={(e) => setPlanChoice(e.target.value)}>
                      <option value="3month">3-Month Plan</option>
                      <option value="12month">12-Month Plan</option>
                    </select>
                    <button className="btn btn-primary btn-sm"
                      onClick={() => activatePlanMutation.mutate({ id: u.id, plan: planChoice })}
                      disabled={activatePlanMutation.isPending || (u.vendor_subscription_status === 'active' && u.vendor_plan === planChoice)}>
                      {activatePlanMutation.isPending ? 'Activating…' : 'Activate'}
                    </button>
                  </div>
                </div>
              )}

              {/* Role */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <div style={sectionLabel}>Role</div>
                {isSelf ? (
                  <p className="muted text-13">You cannot change your own role.</p>
                ) : (
                  <div className="flex gap-10">
                    <select style={selectStyle} value={roleChoice} onChange={(e) => setRoleChoice(e.target.value)}>
                      <option value="customer">Customer</option>
                      <option value="vendor">Vendor</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button className="btn btn-primary btn-sm"
                      onClick={() => changeRoleMutation.mutate({ id: u.id, role: roleChoice })}
                      disabled={changeRoleMutation.isPending || roleChoice === u.role}>
                      {changeRoleMutation.isPending ? 'Saving…' : 'Save role'}
                    </button>
                  </div>
                )}
              </div>

              {/* Danger zone */}
              <div className="flex gap-10" style={{ justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                {!isBanned ? (
                  <button className="btn btn-ghost btn-sm" style={{ color: '#E11D48' }}
                    onClick={() => setConfirmBanId(u.id)}>Ban user</button>
                ) : (
                  <button className="btn btn-sm" style={{ background: '#E11D48', color: '#fff', border: 'none' }}
                    onClick={() => setConfirmUnbanId(u.id)}>Unban user</button>
                )}
                <button className="btn btn-ghost btn-sm" style={{ color: '#E11D48' }}
                  onClick={() => setConfirmDeleteId(u.id)}>Delete</button>
                <button className="btn btn-ghost" onClick={() => setEditUser(null)}>Close</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Invite user modal ── */}
      {showInvite && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: 440, padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
            {inviteResult ? (
              <>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>User created ✓</h2>
                <p style={{ color: 'var(--muted)', fontSize: 14 }}>
                  Share these credentials with <strong>{inviteResult.user?.name}</strong>:
                </p>
                <div style={{ background: 'var(--bg-2)', borderRadius: 8, padding: '12px 16px', fontSize: 13 }}>
                  <div><span className="muted">Email: </span><strong>{inviteResult.user?.email}</strong></div>
                  <div style={{ marginTop: 6 }}><span className="muted">Temp password: </span><strong style={{ fontFamily: 'monospace' }}>{inviteResult.temporary_password}</strong></div>
                </div>
                <p style={{ color: 'var(--muted)', fontSize: 12 }}>Ask the user to change their password after first login.</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn btn-primary" onClick={() => setShowInvite(false)}>Done</button>
                </div>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>Invite user</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 }}>Full name</label>
                    <input className="input" style={{ width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-2)', outline: 'none', boxSizing: 'border-box' }}
                      placeholder="Jane Smith" value={inviteForm.name}
                      onChange={(e) => setInviteForm((f) => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 }}>Email address</label>
                    <input className="input" type="email" style={{ width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-2)', outline: 'none', boxSizing: 'border-box' }}
                      placeholder="jane@example.com" value={inviteForm.email}
                      onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 }}>Role</label>
                    <select className="input" style={{ width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-2)', outline: 'none', boxSizing: 'border-box' }}
                      value={inviteForm.role}
                      onChange={(e) => setInviteForm((f) => ({ ...f, role: e.target.value }))}>
                      <option value="customer">Customer</option>
                      <option value="vendor">Vendor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  {inviteErr && <p style={{ color: '#E11D48', fontSize: 13 }}>{inviteErr}</p>}
                </div>
                <div className="flex gap-10" style={{ justifyContent: 'flex-end' }}>
                  <button className="btn btn-ghost" onClick={() => setShowInvite(false)} disabled={inviteMutation.isPending}>Cancel</button>
                  <button className="btn btn-primary"
                    disabled={inviteMutation.isPending || !inviteForm.name || !inviteForm.email}
                    onClick={() => { setInviteErr(''); inviteMutation.mutate(inviteForm); }}>
                    {inviteMutation.isPending ? 'Creating…' : 'Create user'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Create user modal (admin sets password) ── */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div className="card" style={{ width: 440, maxWidth: '100%', padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Create user</h2>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: -8 }}>Set up an account with a password you choose. The user can sign in immediately.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 }}>Full name</label>
                <input className="input" style={{ width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-2)', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="Jane Smith" value={createForm.name}
                  onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 }}>Email address</label>
                <input className="input" type="email" style={{ width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 8, background: 'var(--bg-2)', outline: 'none', boxSizing: 'border-box',
                  border: `1px solid ${createForm.email && !EMAIL_RE.test(createForm.email) ? '#E11D48' : 'var(--border)'}` }}
                  placeholder="jane@example.com" value={createForm.email}
                  onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))} />
                {createForm.email && !EMAIL_RE.test(createForm.email) && (
                  <p style={{ fontSize: 11, marginTop: 5, color: '#E11D48' }}>Enter a valid email address (e.g. jane@example.com).</p>
                )}
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input className="input" type={showCreatePw ? 'text' : 'password'} style={{ width: '100%', padding: '8px 12px', paddingRight: 38, fontSize: 13, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-2)', outline: 'none', boxSizing: 'border-box' }}
                    placeholder="At least 8 characters" value={createForm.password}
                    onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))} />
                  <button type="button" onClick={() => setShowCreatePw((v) => !v)} aria-label={showCreatePw ? 'Hide password' : 'Show password'}
                    style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}>
                    <Icon name={showCreatePw ? 'eye-off' : 'eye'} size={16} />
                  </button>
                </div>
                <p style={{ fontSize: 11, marginTop: 5, color: createForm.password && createForm.password.length < 8 ? '#E11D48' : 'var(--muted)' }}>
                  Must be at least 8 characters{createForm.password ? ` (${createForm.password.length}/8)` : ''}.
                </p>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 }}>Role</label>
                <select className="input" style={{ width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-2)', outline: 'none', boxSizing: 'border-box' }}
                  value={createForm.role}
                  onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value }))}>
                  <option value="customer">Customer</option>
                  <option value="vendor">Vendor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {createErr && <p style={{ color: '#E11D48', fontSize: 13 }}>{createErr}</p>}
            </div>
            {(() => {
              const reason = !createForm.name.trim() ? 'Enter a full name to continue.'
                : !createForm.email.trim() ? 'Enter an email address to continue.'
                : !EMAIL_RE.test(createForm.email) ? 'Enter a valid email address.'
                : createForm.password.length < 8 ? 'Password must be at least 8 characters.'
                : '';
              return (
                <div className="flex items-center gap-10" style={{ justifyContent: 'flex-end' }}>
                  {!createUserMutation.isPending && reason && (
                    <span className="text-12 muted" style={{ marginRight: 'auto' }}>{reason}</span>
                  )}
                  <button className="btn btn-ghost" onClick={() => setShowCreate(false)} disabled={createUserMutation.isPending}>Cancel</button>
                  <button className="btn btn-primary"
                    disabled={createUserMutation.isPending || !!reason}
                    onClick={() => { setCreateErr(''); createUserMutation.mutate(createForm); }}>
                    {createUserMutation.isPending ? 'Creating…' : 'Create user'}
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Services
const PER_PAGE = 15;
function AdminServices() {
  const user = useAuthUser();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  // Debounce search input 350 ms
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const { data: apiResult, isLoading } = useQuery({
    queryKey: ['admin-services', debouncedSearch, page],
    queryFn: () => adminApi.services({ search: debouncedSearch || undefined, page, per_page: PER_PAGE }),
    enabled: !!user,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
  const qc = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteService(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-services'] }); setConfirmId(null); },
  });
  const featureMutation = useMutation({
    mutationFn: (id: number) => adminApi.toggleFeatured(id),
    onSuccess: (_data, id) => {
      qc.setQueryData(['admin-services', debouncedSearch, page], (old: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        if (!old) return old;
        return { ...old, data: old.data.map((s: any) => s.id === id ? { ...s, is_featured: !s.is_featured } : s) }; // eslint-disable-line @typescript-eslint/no-explicit-any
      });
    },
  });
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const services: any[] = apiResult?.data ?? []; // eslint-disable-line @typescript-eslint/no-explicit-any
  const total: number = apiResult?.total ?? 0;
  const lastPage: number = apiResult?.last_page ?? 1;
  const confirmService = confirmId != null ? services.find((s: any) => s.id === confirmId) : null;

  const sk = { height: 14, borderRadius: 6, background: 'linear-gradient(90deg,var(--bg-3) 25%,var(--bg-2) 50%,var(--bg-3) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' } as const;

  // Page number list (max 7 buttons)
  const pageNumbers = (() => {
    if (lastPage <= 7) return Array.from({ length: lastPage }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, -1, lastPage];
    if (page >= lastPage - 3) return [1, -1, lastPage - 4, lastPage - 3, lastPage - 2, lastPage - 1, lastPage];
    return [1, -1, page - 1, page, page + 1, -2, lastPage];
  })();

  return (
    <div>
      <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 32 }}>Services</h1>
          {!isLoading && <p className="muted text-13 mt-4">{total.toLocaleString()} service{total !== 1 ? 's' : ''} total</p>}
        </div>
        <div className="flex gap-10 items-center" style={{ flex: '1 1 240px', minWidth: 0, justifyContent: 'flex-end' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 0, maxWidth: 280 }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <Icon name="search" size={14} color="var(--muted)" />
            </span>
            <input
              type="text"
              placeholder="Search services…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 32, paddingRight: 12, height: 36, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-2)', fontSize: 13, width: '100%', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>
        </div>
      </div>

      <div className="card mt-20" style={{ overflow: 'hidden' }}>
        <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th className="hide-mobile hide-desktop-sm"></th>
              <th>Service</th>
              <th className="hide-mobile">Vendor</th>
              <th className="hide-mobile">Category</th>
              <th className="hide-tablet">Location</th>
              <th>Price</th>
              <th className="hide-tablet">Rating</th>
              <th className="hide-mobile">Status</th>
              <th>Featured</th>
              <th style={{ textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [1,2,3,4,5].map((i) => (
                <tr key={i}>
                  <td className="hide-mobile hide-desktop-sm"><div style={{ ...sk, width: 56, height: 40, borderRadius: 8 }} /></td>
                  <td><div style={{ ...sk, width: 140 }} /></td>
                  <td className="hide-mobile"><div style={{ ...sk, width: 100 }} /></td>
                  <td className="hide-mobile"><div style={{ ...sk, width: 80 }} /></td>
                  <td className="hide-tablet"><div style={{ ...sk, width: 80 }} /></td>
                  <td><div style={{ ...sk, width: 60 }} /></td>
                  <td className="hide-tablet"><div style={{ ...sk, width: 40 }} /></td>
                  <td className="hide-mobile"><div style={{ ...sk, width: 50 }} /></td>
                  <td><div style={{ ...sk, width: 36, height: 20, borderRadius: 999 }} /></td>
                  <td></td>
                </tr>
              ))
            ) : services.length === 0 ? (
              <tr><td colSpan={10} style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>
                {debouncedSearch ? `No services match "${debouncedSearch}".` : 'No services yet.'}
              </td></tr>
            ) : services.map((s: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
              const slug = s.category?.slug ?? '';
              const cat  = CATEGORIES.find((c) => c.slug === slug);
              const imgRaw = s.images?.[0];
              const img = typeof imgRaw === 'string' ? imgRaw : (imgRaw?.url ?? '');
              const vendorName = s.vendor?.vendorProfile?.business_name ?? s.vendor?.name ?? '—';
              const catName = s.category?.name ?? cat?.name ?? '—';
              const status = s.status ?? 'active';
              return (
                <tr key={s.id}>
                  <td className="hide-mobile hide-desktop-sm" style={{ width: 72, minWidth: 72 }}>
                    {img && (
                      <div style={{ width: 56, height: 40, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                        <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      </div>
                    )}
                  </td>
                  <td className="fw-600">{s.title}</td>
                  <td className="muted text-13 hide-mobile">{vendorName}</td>
                  <td className="hide-mobile"><span className="chip chip-soft" style={{ fontSize: 11 }}>{catName}</span></td>
                  <td className="muted text-13 hide-tablet">{s.location}</td>
                  <td className="fw-700">€{Number(s.minimum_price).toLocaleString()}</td>
                  <td className="hide-tablet">
                    <div className="flex items-center gap-4">
                      <Icon name="star" size={12} color="#F7C24A" />
                      <span className="fw-600 text-13">{Number(s.rating).toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="hide-mobile">
                    <span className="chip" style={{ background: status === 'active' ? '#E6F7F0' : '#FFF7E6', color: status === 'active' ? '#059669' : '#D97706', fontSize: 11 }}>{status}</span>
                  </td>
                  <td>
                    {/* Featured toggle */}
                    <button
                      onClick={() => featureMutation.mutate(s.id)}
                      disabled={featureMutation.isPending && featureMutation.variables === s.id}
                      title={s.is_featured ? 'Remove from featured' : 'Mark as featured'}
                      style={{
                        position: 'relative', display: 'inline-flex', alignItems: 'center',
                        width: 36, height: 20, borderRadius: 999, border: 'none', cursor: 'pointer',
                        padding: 0, flexShrink: 0, outline: 'none',
                        background: s.is_featured ? 'var(--primary)' : 'var(--bg-3)',
                        transition: 'background 0.2s',
                        opacity: (featureMutation.isPending && featureMutation.variables === s.id) ? 0.6 : 1,
                      }}
                    >
                      <span style={{
                        position: 'absolute', width: 14, height: 14, borderRadius: 999, background: 'white',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        left: s.is_featured ? 19 : 3,
                        transition: 'left 0.2s',
                      }} />
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => router.visit(`/service/${s.id}`)}><Icon name="eye" size={12} /></button>
                    <button className="btn btn-ghost btn-sm" style={{ color: '#E11D48' }}
                      onClick={() => setConfirmId(s.id)}><Icon name="trash" size={12} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        </div>{/* tbl-wrap */}

        {/* Pagination footer */}
        {lastPage > 1 && (
          <div className="flex items-center justify-between" style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
            <span className="muted text-13">
              Page {page} of {lastPage}
            </span>
            <div className="flex gap-4">
              <button className="btn btn-ghost btn-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                ‹ Prev
              </button>
              {pageNumbers.map((n, i) =>
                n < 0 ? (
                  <span key={n + '_' + i} style={{ padding: '0 4px', color: 'var(--muted)', alignSelf: 'center' }}>…</span>
                ) : (
                  <button
                    key={n}
                    className="btn btn-sm"
                    style={n === page
                      ? { background: 'var(--primary)', color: '#fff', border: 'none', minWidth: 32 }
                      : { background: 'transparent', border: '1px solid var(--border)', minWidth: 32 }}
                    onClick={() => setPage(n)}
                  >{n}</button>
                )
              )}
              <button className="btn btn-ghost btn-sm" onClick={() => setPage((p) => Math.min(lastPage, p + 1))} disabled={page === lastPage}>
                Next ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {confirmId != null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: 420, padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Delete service?</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>
              Are you sure you want to delete <strong>{confirmService?.title ?? 'this service'}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-10" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setConfirmId(null)} disabled={deleteMutation.isPending}>Cancel</button>
              <button className="btn btn-primary" style={{ background: '#E11D48', borderColor: '#E11D48' }}
                onClick={() => deleteMutation.mutate(confirmId)}
                disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Blog post modal
interface PostForm { title: string; slug: string; body: string; cover_image_url: string; read_time_minutes: string; published_at: string }
const emptyForm = (): PostForm => ({ title: '', slug: '', body: '', cover_image_url: '', read_time_minutes: '', published_at: '' });

function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

function PostModal({ post, onClose }: { post?: { id: number } & PostForm; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<PostForm>(post ? { ...post } : emptyForm());
  const [err, setErr] = useState('');

  const saveMutation = useMutation({
    mutationFn: (d: PostForm) => post
      ? adminApi.updatePost(post.id, d)
      : adminApi.createPost(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-blog'] }); onClose(); },
    onError: () => setErr('Save failed. Check all required fields.'),
  });

  const set = (k: keyof PostForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    setForm((f) => ({
      ...f,
      [k]: val,
      ...(k === 'title' && !post ? { slug: slugify(val) } : {}),
    }));
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="card card-pad" style={{ width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="flex items-center justify-between mb-20">
          <h3 style={{ fontSize: 20 }}>{post ? 'Edit post' : 'New post'}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><Icon name="close" size={16} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div><label className="field-label">Title *</label><input className="input mt-8" value={form.title} onChange={set('title')} /></div>
          <div><label className="field-label">Slug *</label><input className="input mt-8" value={form.slug} onChange={set('slug')} /></div>
          <div><label className="field-label">Body *</label><textarea className="textarea mt-8" rows={6} value={form.body} onChange={set('body')} /></div>
          <div><label className="field-label">Cover image URL</label><input className="input mt-8" value={form.cover_image_url} onChange={set('cover_image_url')} /></div>
          <div className="flex gap-12">
            <div style={{ flex: 1 }}><label className="field-label">Read time (min)</label><input type="number" className="input mt-8" value={form.read_time_minutes} onChange={set('read_time_minutes')} /></div>
            <div style={{ flex: 1 }}><label className="field-label">Publish date</label><input type="datetime-local" className="input mt-8" value={form.published_at} onChange={set('published_at')} /></div>
          </div>
        </div>
        {err && <p style={{ color: '#E11D48', fontSize: 13, marginTop: 8 }}>{err}</p>}
        <div className="flex gap-8 mt-20" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving…' : 'Save post'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Blog
function AdminBlog() {
  const qc = useQueryClient();
  const user = useAuthUser();
  const [modal, setModal] = useState<null | 'new' | { id: number; title: string; slug: string; body: string; cover_image_url: string; read_time_minutes: string; published_at: string }>(null);

  const { data: blogResult } = useQuery({
    queryKey: ['admin-blog'],
    queryFn: () => adminApi.blog(),
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deletePost(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-blog'] }),
  });

  interface DisplayPost { id: number; cover: string; published: boolean; readTime: number; title: string; excerpt: string; author: string; date: string; slug: string; body: string; cover_image_url: string; read_time_minutes: string; published_at: string }
  const apiPosts: DisplayPost[] = Array.isArray(blogResult?.data)
    ? blogResult.data.map((p: any): DisplayPost => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
        id: p.id,
        slug: p.slug,
        title: p.title,
        excerpt: (p.body ?? '').replace(/<[^>]*>/g, '').slice(0, 120),
        cover: p.cover_image_url ?? '',
        author: 'Admin',
        readTime: p.read_time_minutes ?? 3,
        published: !!p.published_at,
        date: formatDate(p.published_at),
        body: p.body ?? '',
        cover_image_url: p.cover_image_url ?? '',
        read_time_minutes: String(p.read_time_minutes ?? ''),
        published_at: p.published_at ? p.published_at.slice(0, 16).replace(' ', 'T') : '',
      }))
    : [];

  return (
    <div>
      {modal && (
        <PostModal
          post={modal === 'new' ? undefined : modal}
          onClose={() => setModal(null)}
        />
      )}
      <div className="flex items-center justify-between">
        <h1 style={{ fontSize: 32 }}>Blog</h1>
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          onClick={() => setModal('new')}>
          <Icon name="plus" size={14} /> New post
        </button>
      </div>

      {apiPosts.length === 0 && !blogResult ? (
        <div className="grid r-grid-3 mt-20" style={{ gap: 16 }}>
          {[1,2,3].map((i) => {
            const sk = { background: 'linear-gradient(90deg,var(--bg-3) 25%,var(--bg-2) 50%,var(--bg-3) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' } as const;
            return (
              <div key={i} className="card" style={{ overflow: 'hidden' }}>
                <div style={{ width: '100%', aspectRatio: '16/10', ...sk }} />
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ height: 14, width: '60%', borderRadius: 6, ...sk }} />
                  <div style={{ height: 12, width: '90%', borderRadius: 6, ...sk }} />
                  <div style={{ height: 12, width: '70%', borderRadius: 6, ...sk }} />
                </div>
              </div>
            );
          })}
        </div>
      ) : apiPosts.length === 0 ? (
        <div className="card card-pad mt-20" style={{ textAlign: 'center', color: 'var(--muted)' }}>No blog posts yet. Click "New post" to create one.</div>
      ) : (
        <div className="grid r-grid-3 mt-20" style={{ gap: 16 }}>
          {apiPosts.map((p) => (
            <div key={p.id} className="card" style={{ overflow: 'hidden' }}>
              {p.cover && <img src={p.cover} alt={p.title} style={{ width: '100%', aspectRatio: '16/10', objectFit: 'cover' }} />}
              {!p.cover && <div style={{ width: '100%', aspectRatio: '16/10', background: 'var(--bg-3)', display: 'grid', placeItems: 'center' }}><Icon name="camera" size={28} color="var(--line)" /></div>}
              <div style={{ padding: 16 }}>
                <div className="flex items-center justify-between">
                  <span className="chip" style={p.published
                    ? { background: '#E6F7F0', color: '#059669', fontSize: 11 }
                    : { background: '#FFF7E6', color: '#D97706', fontSize: 11 }}>
                    {p.published ? 'Published' : 'Draft'}
                  </span>
                  <span className="muted text-12">{p.readTime} min read</span>
                </div>
                <h4 className="mt-12" style={{ fontSize: 15, lineHeight: 1.35 }}>{p.title}</h4>
                <p className="muted text-13 mt-8" style={{ lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{p.excerpt}</p>
                <div className="flex items-center justify-between mt-16">
                  <div className="muted text-12">by {p.author} · {p.date}</div>
                  <div className="flex gap-6">
                    <button className="btn btn-ghost btn-sm" onClick={() => setModal({ id: p.id, title: p.title, slug: p.slug, body: p.body, cover_image_url: p.cover_image_url, read_time_minutes: p.read_time_minutes, published_at: p.published_at })}>
                      <Icon name="pencil" size={12} />
                    </button>
                    <button className="btn btn-ghost btn-sm" style={{ color: '#E11D48' }}
                      onClick={() => { if (confirm('Delete this post?')) deleteMutation.mutate(p.id); }}>
                      <Icon name="trash" size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Dashboard overview
function AdminOverview() {
  const user = useAuthUser();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.stats(),
    enabled: !!user,
    staleTime: 60_000,
  });

  const sk = { borderRadius: 6, background: 'linear-gradient(90deg,var(--bg-3) 25%,var(--bg-2) 50%,var(--bg-3) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' } as const;

  const statCards = [
    { tone: 'neutral', icon: 'cart',     label: 'Total Earning',      value: data ? `€${Number(data.total_earning).toLocaleString()}` : '—' },
    { tone: 'amber',   icon: 'bookings', label: 'This Week Users',    value: data ? String(data.this_week_users) : '—' },
    { tone: 'green',   icon: 'check',    label: 'Completed Orders',   value: data ? String(data.completed_orders) : '—' },
    { tone: 'rose',    icon: 'close',    label: 'Declined Orders',    value: data ? String(data.declined_orders) : '—' },
  ];

  const bg: Record<string, string> = { amber: '#FFF7E6', green: '#E6F7F0', neutral: '#F5F5F5', rose: '#FFF0F0' };
  const fg: Record<string, string> = { amber: '#D97706', green: '#059669', neutral: '#6B7280', rose: '#E11D48' };

  return (
    <div>
      <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: 16, marginBottom: 24 }}>
        <h1 style={{ fontSize: 32 }}>Dashboard</h1>
      </div>

      {/* Stat cards */}
      <div className="grid r-grid-4" style={{ gap: 16 }}>
        {statCards.map((s) => (
          <div key={s.label} className="card card-pad" style={{ background: bg[s.tone] }}>
            <div className="flex items-center gap-12">
              <div style={{ color: fg[s.tone] }}><Icon name={s.icon} size={32} /></div>
              <div>
                {isLoading
                  ? <div style={{ ...sk, width: 60, height: 28, marginBottom: 6 }} />
                  : <div style={{ fontSize: 28, fontWeight: 700, color: fg[s.tone] }}>{s.value}</div>}
                <div style={{ fontSize: 13, fontWeight: 600, color: fg[s.tone] }}>{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lower panels */}
      <div className="dash-grid-3 mt-20" style={{ gap: 16 }}>

        {/* New Users */}
        <div className="card card-pad">
          <div className="flex items-center justify-between mb-16">
            <span style={{ fontWeight: 700, fontSize: 15 }}>New Users</span>
            <Link href="/dashboard/admin/users" style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'none' }}>View all</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {isLoading ? [1,2,3].map((i) => (
              <div key={i} className="flex items-center gap-10" style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                <div style={{ ...sk, width: 36, height: 36, borderRadius: 999, flexShrink: 0 }} />
                <div style={{ ...sk, width: 120, height: 13 }} />
              </div>
            )) : (data?.new_users ?? []).map((u: any, i: number, arr: any[]) => (
              <div key={u.id} className="flex items-center justify-between" style={{ padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : 'none' }}>
                <div className="flex items-center gap-10">
                  <div style={{ width: 36, height: 36, borderRadius: 999, background: 'var(--primary-50)', color: 'var(--primary-700)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0, overflow: 'hidden' }}>
                    {u.avatar_url ? <img src={u.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : u.name[0]?.toUpperCase()}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{u.name}</span>
                </div>
                <span className="muted text-13">{u.joined}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Vendors waiting for approval */}
        <div className="card card-pad">
          <div className="flex items-center justify-between mb-16">
            <span style={{ fontWeight: 700, fontSize: 15 }}>Vendors waiting for approval</span>
            <Link href="/dashboard/admin/vendors" style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'none' }}>View all</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {isLoading ? [1,2,3].map((i) => (
              <div key={i} className="flex items-center gap-10" style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                <div style={{ ...sk, width: 36, height: 36, borderRadius: 999, flexShrink: 0 }} />
                <div style={{ ...sk, width: 140, height: 13 }} />
              </div>
            )) : (data?.pending_vendors ?? []).length === 0 ? (
              <p className="muted text-13" style={{ padding: '10px 0' }}>No vendors pending approval.</p>
            ) : (data?.pending_vendors ?? []).map((v: any, i: number, arr: any[]) => (
              <div key={v.id} className="flex items-center gap-10" style={{ padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: 999, background: 'var(--bg-3)', color: 'var(--ink-2)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0, overflow: 'hidden' }}>
                  {v.avatar_url ? <img src={v.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : v.business_name[0]?.toUpperCase()}
                </div>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{v.business_name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Orders */}
        <div className="card card-pad">
          <div className="flex items-center justify-between mb-16">
            <span style={{ fontWeight: 700, fontSize: 15 }}>Today's Order</span>
            <Link href="/dashboard/admin/orders" style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'none' }}>View all</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {isLoading ? [1,2].map((i) => (
              <div key={i} className="flex items-center gap-10" style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                <div style={{ ...sk, width: 36, height: 36, borderRadius: 8, flexShrink: 0 }} />
                <div style={{ ...sk, width: 100, height: 13 }} />
              </div>
            )) : (data?.todays_orders ?? []).length === 0 ? (
              <p className="muted text-13" style={{ padding: '10px 0' }}>No orders today.</p>
            ) : (data?.todays_orders ?? []).map((o: any, i: number, arr: any[]) => (
              <div key={o.id} className="flex items-center justify-between" style={{ padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : 'none' }}>
                <div className="flex items-center gap-10">
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-3)', display: 'grid', placeItems: 'center', flexShrink: 0, overflow: 'hidden' }}>
                    {o.image ? <img src={typeof o.image === 'string' ? o.image : o.image?.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Icon name="cart" size={16} color="var(--muted)" />}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 500, textTransform: 'capitalize' }}>{o.service_title}</span>
                </div>
                <span className="muted text-13">{o.date}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Vendors
function AdminVendors() {
  const user = useAuthUser();
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedQ(q); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [q]);

  const { data: apiResult, isLoading } = useQuery({
    queryKey: ['admin-vendors', debouncedQ, page],
    queryFn: () => adminApi.vendors({ ...(debouncedQ && { search: debouncedQ }), page }),
    enabled: !!user,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteUser(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-vendors'] }); setConfirmId(null); },
  });
  const [confirmId, setConfirmId] = useState<number | null>(null);

  // Setup panel + inline "New vendor" creation
  const [setupVendorId, setSetupVendorId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '' });
  const [showCreatePw, setShowCreatePw] = useState(false);
  const [createErr, setCreateErr] = useState('');

  const createVendorMutation = useMutation({
    mutationFn: (d: { name: string; email: string; password: string }) => adminApi.createUser({ ...d, role: 'vendor' }),
    onSuccess: (res: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      setShowCreate(false);
      qc.invalidateQueries({ queryKey: ['admin-vendors'] });
      const newId = res?.user?.id;
      if (newId) setSetupVendorId(newId);
    },
    onError: (err: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      setCreateErr(err?.response?.data?.message ?? Object.values(err?.response?.data?.errors ?? {})[0]?.[0] ?? 'Could not create vendor.');
    },
  });

  const list: any[] = apiResult?.data ?? []; // eslint-disable-line @typescript-eslint/no-explicit-any
  const total: number = apiResult?.total ?? 0;
  const lastPage: number = apiResult?.last_page ?? 1;
  const confirmVendor = confirmId != null ? list.find((v: any) => v.id === confirmId) : null; // eslint-disable-line @typescript-eslint/no-explicit-any

  const statusChip = (s: string) => {
    if (s === 'Approved')   return { background: '#E6F7F0', color: '#059669' };
    if (s === 'Onboarding') return { background: '#FFF7E6', color: '#D97706' };
    return { background: '#FFF0F0', color: '#E11D48' };
  };

  const pageNumbers = (() => {
    if (lastPage <= 7) return Array.from({ length: lastPage }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, -1, lastPage];
    if (page >= lastPage - 3) return [1, -1, lastPage - 4, lastPage - 3, lastPage - 2, lastPage - 1, lastPage];
    return [1, -1, page - 1, page, page + 1, -2, lastPage];
  })();

  return (
    <div>
      <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 32 }}>Vendors</h1>
        <div className="flex items-center gap-8" style={{ flexWrap: 'wrap', flex: '1 1 auto', justifyContent: 'flex-end' }}>
          <div style={{ position: 'relative', flex: '1 1 180px', maxWidth: 260 }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><Icon name="search" size={14} color="var(--muted)" /></span>
            <input type="text" placeholder="Search vendors…" value={q} onChange={(e) => setQ(e.target.value)}
              style={{ paddingLeft: 32, paddingRight: 12, height: 36, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-2)', fontSize: 13, width: '100%', outline: 'none' }} />
          </div>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}
            onClick={() => { setCreateForm({ name: '', email: '', password: '' }); setCreateErr(''); setShowCreatePw(false); setShowCreate(true); }}>
            <Icon name="plus" size={14} /> New vendor
          </button>
        </div>
      </div>

      <div className="card mt-20" style={{ overflow: 'hidden' }}>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Email</th>
                <th>Business Name</th>
                <th className="hide-mobile">Service</th>
                <th className="hide-mobile">Total Orders</th>
                <th className="hide-tablet">Total Earning</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? [1,2,3,4,5].map((i) => (
                <tr key={i}>{[160,120,80,50,60,70,0].map((w, j) => (
                  <td key={j}>{w > 0 && <div style={{ height: 14, borderRadius: 6, width: w, background: 'var(--bg-3)' }} />}</td>
                ))}</tr>
              )) : list.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>No vendors found.</td></tr>
              ) : list.map((v: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                <tr key={v.id}>
                  <td className="tbl-name-cell">
                    <div className="flex items-center gap-10">
                      <div style={{ width: 32, height: 32, borderRadius: 999, background: 'var(--primary-50)', color: 'var(--primary-700)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0, overflow: 'hidden' }}>
                        {v.avatar_url ? <img src={v.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : v.email[0]?.toUpperCase()}
                      </div>
                      <span className="text-13">{v.email}</span>
                    </div>
                  </td>
                  <td className="fw-600">{v.business_name}</td>
                  <td className="hide-mobile"><span className="chip chip-soft" style={{ fontSize: 11 }}>{v.category}</span></td>
                  <td className="hide-mobile muted text-13">{v.total_orders} orders</td>
                  <td className="hide-tablet fw-600">€{Number(v.total_earning).toLocaleString()}</td>
                  <td><span className="chip" style={{ ...statusChip(v.status), fontSize: 11 }}>{v.status}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-ghost btn-sm" title="Setup vendor" onClick={() => setSetupVendorId(v.id)}>
                      <Icon name="pencil" size={12} />
                    </button>
                    <button className="btn btn-ghost btn-sm" style={{ color: '#E11D48' }} title="Delete" onClick={() => setConfirmId(v.id)}>
                      <Icon name="trash" size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between" style={{ padding: '12px 18px', borderTop: '1px solid var(--border)' }}>
          <span className="muted text-13">Showing {list.length} of {total} vendors</span>
          {lastPage > 1 && (
            <div className="flex gap-4">
              <button className="btn btn-ghost btn-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>‹ Prev</button>
              {pageNumbers.map((n, i) => n < 0
                ? <span key={n + '_' + i} style={{ padding: '0 4px', color: 'var(--muted)', alignSelf: 'center' }}>…</span>
                : <button key={n} className="btn btn-sm"
                    style={n === page ? { background: 'var(--primary)', color: '#fff', border: 'none', minWidth: 32 } : { background: 'transparent', border: '1px solid var(--border)', minWidth: 32 }}
                    onClick={() => setPage(n)}>{n}</button>
              )}
              <button className="btn btn-ghost btn-sm" onClick={() => setPage((p) => Math.min(lastPage, p + 1))} disabled={page === lastPage}>Next ›</button>
            </div>
          )}
        </div>
      </div>

      {confirmId != null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: 420, padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Delete vendor?</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>Permanently delete <strong>{confirmVendor?.business_name ?? confirmVendor?.email ?? 'this vendor'}</strong> and all their data? <span style={{ color: '#E11D48', fontWeight: 600 }}>This cannot be undone.</span></p>
            <div className="flex gap-10" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setConfirmId(null)} disabled={deleteMutation.isPending}>Cancel</button>
              <button className="btn btn-primary" style={{ background: '#E11D48', borderColor: '#E11D48' }}
                onClick={() => deleteMutation.mutate(confirmId!)} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New vendor modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div className="card" style={{ width: 440, maxWidth: '100%', padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>New vendor</h2>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: -8 }}>Create the vendor account, then set up their profile and service.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 }}>Full name</label>
                <input className="input" style={{ width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-2)', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="Jane Smith" value={createForm.name} onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 }}>Email address</label>
                <input className="input" type="email" style={{ width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 8, background: 'var(--bg-2)', outline: 'none', boxSizing: 'border-box',
                  border: `1px solid ${createForm.email && !EMAIL_RE.test(createForm.email) ? '#E11D48' : 'var(--border)'}` }}
                  placeholder="jane@example.com" value={createForm.email} onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))} />
                {createForm.email && !EMAIL_RE.test(createForm.email) && (
                  <p style={{ fontSize: 11, marginTop: 5, color: '#E11D48' }}>Enter a valid email address.</p>
                )}
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input className="input" type={showCreatePw ? 'text' : 'password'} style={{ width: '100%', padding: '8px 12px', paddingRight: 38, fontSize: 13, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-2)', outline: 'none', boxSizing: 'border-box' }}
                    placeholder="At least 8 characters" value={createForm.password} onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))} />
                  <button type="button" onClick={() => setShowCreatePw((v) => !v)} aria-label={showCreatePw ? 'Hide password' : 'Show password'}
                    style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}>
                    <Icon name={showCreatePw ? 'eye-off' : 'eye'} size={16} />
                  </button>
                </div>
                <p style={{ fontSize: 11, marginTop: 5, color: createForm.password && createForm.password.length < 8 ? '#E11D48' : 'var(--muted)' }}>
                  Must be at least 8 characters{createForm.password ? ` (${createForm.password.length}/8)` : ''}.
                </p>
              </div>
              {createErr && <p style={{ color: '#E11D48', fontSize: 13 }}>{createErr}</p>}
            </div>
            {(() => {
              const reason = !createForm.name.trim() ? 'Enter a full name to continue.'
                : !createForm.email.trim() ? 'Enter an email address to continue.'
                : !EMAIL_RE.test(createForm.email) ? 'Enter a valid email address.'
                : createForm.password.length < 8 ? 'Password must be at least 8 characters.'
                : '';
              return (
                <div className="flex items-center gap-10" style={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  {!createVendorMutation.isPending && reason && <span className="text-12 muted" style={{ marginRight: 'auto', flex: '1 1 100%' }}>{reason}</span>}
                  <button className="btn btn-ghost" onClick={() => setShowCreate(false)} disabled={createVendorMutation.isPending}>Cancel</button>
                  <button className="btn btn-primary" disabled={createVendorMutation.isPending || !!reason}
                    onClick={() => { setCreateErr(''); createVendorMutation.mutate(createForm); }}>
                    {createVendorMutation.isPending ? 'Creating…' : 'Create & set up'}
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Vendor setup panel */}
      {setupVendorId != null && (
        <VendorSetupPanel vendorId={setupVendorId} onClose={() => { setSetupVendorId(null); qc.invalidateQueries({ queryKey: ['admin-vendors'] }); }} />
      )}
    </div>
  );
}

// ─── Orders
function AdminOrders() {
  const user = useAuthUser();
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedQ(q); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [q]);

  const { data: apiResult, isLoading } = useQuery({
    queryKey: ['admin-orders', debouncedQ, page],
    queryFn: () => adminApi.orders({ ...(debouncedQ && { search: debouncedQ }), page }),
    enabled: !!user,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

  const list: any[] = apiResult?.data ?? []; // eslint-disable-line @typescript-eslint/no-explicit-any
  const total: number = apiResult?.total ?? 0;
  const lastPage: number = apiResult?.last_page ?? 1;

  const statusChip = (s: string) => {
    if (s === 'approved') return { background: '#E6F7F0', color: '#059669' };
    if (s === 'rejected') return { background: '#FFF0F0', color: '#E11D48' };
    return { background: '#FFF7E6', color: '#D97706' };
  };

  const catLabel = (slug: string) => CATEGORIES.find((c) => c.slug === slug)?.name ?? slug ?? '—';

  const pageNumbers = (() => {
    if (lastPage <= 7) return Array.from({ length: lastPage }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, -1, lastPage];
    if (page >= lastPage - 3) return [1, -1, lastPage - 4, lastPage - 3, lastPage - 2, lastPage - 1, lastPage];
    return [1, -1, page - 1, page, page + 1, -2, lastPage];
  })();

  return (
    <div>
      <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 32 }}>Orders</h1>
        <div className="flex items-center gap-10" style={{ flex: '1 1 240px', minWidth: 0, justifyContent: 'flex-end' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 0, maxWidth: 280 }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><Icon name="search" size={14} color="var(--muted)" /></span>
            <input type="text" placeholder="Search by email…" value={q} onChange={(e) => setQ(e.target.value)}
              style={{ paddingLeft: 32, paddingRight: 12, height: 36, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-2)', fontSize: 13, width: '100%', boxSizing: 'border-box', outline: 'none' }} />
          </div>
          <button className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <Icon name="download" size={14} /> Export Filters
          </button>
        </div>
      </div>

      <div className="card mt-20" style={{ overflow: 'hidden' }}>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Placed by</th>
                <th className="hide-mobile">Vendor</th>
                <th className="hide-mobile">Service</th>
                <th>Price</th>
                <th className="hide-tablet">Received Date</th>
                <th className="hide-tablet">Deliver Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? [1,2,3,4,5].map((i) => (
                <tr key={i}>{[160,140,80,60,90,90,70].map((w, j) => (
                  <td key={j}><div style={{ height: 14, borderRadius: 6, width: w, background: 'var(--bg-3)' }} /></td>
                ))}</tr>
              )) : list.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>
                  {debouncedQ ? `No orders match "${debouncedQ}".` : 'No orders yet.'}
                </td></tr>
              ) : list.map((o: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                <tr key={o.id}>
                  <td className="text-13">{o.customer_email}</td>
                  <td className="muted text-13 hide-mobile">{o.vendor_email}</td>
                  <td className="hide-mobile"><span className="chip chip-soft" style={{ fontSize: 11 }}>{catLabel(o.service)}</span></td>
                  <td className="fw-700">€{Number(o.price).toLocaleString()}</td>
                  <td className="muted text-13 hide-tablet">{o.received_date}</td>
                  <td className="muted text-13 hide-tablet">{o.deliver_date ?? '—'}</td>
                  <td><span className="chip" style={{ ...statusChip(o.status), fontSize: 11, textTransform: 'capitalize' }}>{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between" style={{ padding: '12px 18px', borderTop: '1px solid var(--border)' }}>
          <span className="muted text-13">Showing {list.length} of {total} orders</span>
          {lastPage > 1 && (
            <div className="flex gap-4">
              <button className="btn btn-ghost btn-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>‹ Prev</button>
              {pageNumbers.map((n, i) => n < 0
                ? <span key={n + '_' + i} style={{ padding: '0 4px', color: 'var(--muted)', alignSelf: 'center' }}>…</span>
                : <button key={n} className="btn btn-sm"
                    style={n === page ? { background: 'var(--primary)', color: '#fff', border: 'none', minWidth: 32 } : { background: 'transparent', border: '1px solid var(--border)', minWidth: 32 }}
                    onClick={() => setPage(n)}>{n}</button>
              )}
              <button className="btn btn-ghost btn-sm" onClick={() => setPage((p) => Math.min(lastPage, p + 1))} disabled={page === lastPage}>Next ›</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Feedback
function AdminFeedback() {
  const user = useAuthUser();
  const { data: apiResult, isLoading } = useQuery({
    queryKey: ['admin-feedback'],
    queryFn: () => adminApi.adminFeedback(),
    enabled: !!user,
    staleTime: 30_000,
  });

  const list: any[] = apiResult?.data ?? []; // eslint-disable-line @typescript-eslint/no-explicit-any

  const expChip = (e: string) => {
    if (e === 'happy') return { background: '#E6F7F0', color: '#059669' };
    if (e === 'sad')   return { background: '#FFF7E6', color: '#D97706' };
    return { background: 'var(--bg-3)', color: 'var(--ink-2)' };
  };

  return (
    <div>
      <h1 style={{ fontSize: 32 }}>Feedbacks</h1>
      <div className="card mt-20" style={{ overflow: 'hidden' }}>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Feedback</th>
                <th>User</th>
                <th className="hide-mobile">User Role</th>
                <th className="hide-mobile">Date</th>
                <th>Experience</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? [1,2,3,4].map((i) => (
                <tr key={i}>{[200,160,70,90,60].map((w, j) => (
                  <td key={j}><div style={{ height: 14, borderRadius: 6, width: w, background: 'var(--bg-3)' }} /></td>
                ))}</tr>
              )) : list.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>No feedbacks yet.</td></tr>
              ) : list.map((fb: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                <tr key={fb.id}>
                  <td style={{ maxWidth: 300 }}>{fb.feedback_text}</td>
                  <td className="text-13">{fb.user_email}</td>
                  <td className="hide-mobile"><span className="chip" style={{ background: 'var(--bg-3)', color: 'var(--ink-2)', fontSize: 11, textTransform: 'capitalize' }}>{fb.user_role}</span></td>
                  <td className="muted text-13 hide-mobile">{fb.date}</td>
                  <td><span className="chip" style={{ ...expChip(fb.experience), fontSize: 11, textTransform: 'capitalize' }}>{fb.experience}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Settings
function AdminSettings() {
  const user = useAuthUser();
  const qc = useQueryClient();
  const { showToast } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['admin-profile'],
    queryFn: () => profileApi.get(),
    enabled: !!user,
    staleTime: 60_000,
  });

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [email, setEmail]         = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      const parts = (profile.name ?? '').split(' ');
      setFirstName(parts[0] ?? '');
      setLastName(parts.slice(1).join(' ') ?? '');
      setEmail(profile.email ?? '');
      setAvatarUrl(profile.avatar_url ?? profile.profile?.avatar_url ?? '');
    }
  }, [profile]);

  const [curPwd, setCurPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confPwd, setConfPwd] = useState('');

  const accountMutation = useMutation({
    mutationFn: () => profileApi.update({ name: [firstName, lastName].filter(Boolean).join(' '), email }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-profile'] }); showToast('Account updated.', 'success'); },
    onError: () => showToast('Failed to update account.', 'error'),
  });

  const passwordMutation = useMutation({
    mutationFn: () => profileApi.updatePassword({ current_password: curPwd, password: newPwd, password_confirmation: confPwd }),
    onSuccess: () => { setCurPwd(''); setNewPwd(''); setConfPwd(''); showToast('Password updated.', 'success'); },
    onError: () => showToast('Failed to update password.', 'error'),
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const url = await uploadApi.avatar(file);
      setAvatarUrl(url);
      await profileApi.update({ avatar_url: url });
      qc.invalidateQueries({ queryKey: ['admin-profile'] });
      showToast('Profile picture updated.', 'success');
    } catch {
      showToast('Failed to upload image.', 'error');
    } finally {
      setAvatarUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: 24, border: '1px solid var(--border)', background: 'var(--bg-2)', fontSize: 13, outline: 'none', boxSizing: 'border-box' };
  const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 };

  if (isLoading) return <div className="muted text-13 mt-20">Loading…</div>;

  return (
    <div>
      <h1 style={{ fontSize: 32 }}>Account Settings</h1>

      <div className="flex items-center gap-16 mt-20">
        <button onClick={() => fileRef.current?.click()} disabled={avatarUploading}
          style={{ width: 88, height: 88, borderRadius: 999, border: '2px dashed var(--primary)', background: 'var(--primary-50)', display: 'grid', placeItems: 'center', cursor: 'pointer', overflow: 'hidden', flexShrink: 0 }}>
          {avatarUrl
            ? <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ color: 'var(--primary)', fontSize: 11, fontWeight: 600, textAlign: 'center', padding: 8, lineHeight: 1.3 }}>
                {avatarUploading ? 'Uploading…' : 'Click to upload an image'}
              </span>
          }
        </button>
        <span className="text-13 muted">Upload your profile picture</span>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
      </div>

      <div className="flex gap-20 mt-24" style={{ flexWrap: 'wrap' }}>
        <div className="card card-pad" style={{ flex: 1, minWidth: 280 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelStyle}>Email</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}><Icon name="mail" size={14} color="var(--muted)" /></span>
                <input style={{ ...inputStyle, paddingLeft: 38 }} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>First Name</label>
              <input style={inputStyle} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Last Name</label>
              <input style={inputStyle} value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
          <button className="btn btn-primary mt-20" style={{ borderRadius: 24, paddingLeft: 28, paddingRight: 28 }}
            onClick={() => accountMutation.mutate()} disabled={accountMutation.isPending}>
            {accountMutation.isPending ? 'Updating…' : 'Update account'}
          </button>
        </div>

        <div className="card card-pad" style={{ flex: 1, minWidth: 280 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelStyle}>Current password</label>
              <input style={inputStyle} type="password" placeholder="Current password" value={curPwd} onChange={(e) => setCurPwd(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>New password</label>
              <input style={inputStyle} type="password" placeholder="New password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Confirm password</label>
              <input style={inputStyle} type="password" placeholder="Confirm password" value={confPwd} onChange={(e) => setConfPwd(e.target.value)} />
            </div>
          </div>
          <button className="btn btn-primary mt-20" style={{ borderRadius: 24, paddingLeft: 28, paddingRight: 28 }}
            onClick={() => passwordMutation.mutate()} disabled={passwordMutation.isPending || !curPwd || !newPwd || newPwd !== confPwd}>
            {passwordMutation.isPending ? 'Updating…' : 'Update password'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface AdminProps {
  sub?: string;
}

// ─── Main dashboard shell
export default function AdminDashboard({ sub: subProp }: AdminProps) {
  const pageProps = usePage().props as AdminProps;
  const sub = subProp ?? pageProps.sub ?? 'dashboard';
  const active = sub || 'dashboard';
  const user = useAuthUser();

  useEffect(() => {
    if (!user) router.visit('/auth', { replace: true });
  }, [user]);

  useEffect(() => {
    document.title = 'Admin Dashboard | Wedbi';
    return () => { document.title = 'Wedbi'; };
  }, []);

  if (!user) return null;

  return (
    <div className="dash-shell">
      <AdminSidebar active={active} />
      <main className="dash-main">
        {active === 'dashboard'  && <AdminOverview />}
        {active === 'users'      && <AdminUsers />}
        {active === 'services'   && <AdminServices />}
        {active === 'vendors'    && <AdminVendors />}
        {(active === 'blogs' || active === 'blog') && <AdminBlog />}
        {active === 'orders'     && <AdminOrders />}
        {active === 'feedback'   && <AdminFeedback />}
        {active === 'settings'   && <AdminSettings />}
      </main>
    </div>
  );
}
