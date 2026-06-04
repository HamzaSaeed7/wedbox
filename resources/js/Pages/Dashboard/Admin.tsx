import { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Icon from '../../components/shared/Icon';
import Logo from '../../components/shared/Logo';
import { useStore, useAuthUser } from '../../store';
import { CATEGORIES } from '../../lib/data';
import { adminApi } from '../../lib/api';
import { formatDate } from '../../lib/utils';

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
  const items = [
    { id: 'users',    href: '/dashboard/admin',          label: 'Users',    icon: 'user' },
    { id: 'services', href: '/dashboard/admin/services', label: 'Services', icon: 'services' },
    { id: 'blog',     href: '/dashboard/admin/blog',     label: 'Blog',     icon: 'blog' },
  ];
  return (
    <aside className="dash-side" style={{ background: 'var(--primary)' }}>
      <div className="brand" style={{ color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <Link href="/" style={{ textDecoration: 'none' }}><Logo light compact /></Link>
        <span style={{ background: 'rgba(255,255,255,.22)', color: 'white', padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>ADMIN</span>
      </div>
      <nav className="dash-nav">
        {items.map((i) => (
          <Link key={i.id} href={i.href}
            style={{ background: active === i.id ? 'rgba(255,255,255,.18)' : 'transparent',
              color: 'white', fontWeight: active === i.id ? 700 : 500,
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
              borderRadius: 10, fontSize: 14, textDecoration: 'none' }}>
            <Icon name={i.icon} size={18} color="white" /> {i.label}
          </Link>
        ))}
      </nav>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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

// ─── Users
function AdminUsers() {
  const [q, setQ] = useState('');
  const [role, setRole] = useState('all');
  const qc = useQueryClient();
  const user = useAuthUser();

  const { data: apiResult, isLoading } = useQuery({
    queryKey: ['admin-users', q, role],
    queryFn: () => adminApi.users({
      ...(q && { search: q }),
      ...(role !== 'all' && { role }),
    }),
    enabled: !!user,
    staleTime: 30_000,
  });

  const banMutation   = useMutation({ mutationFn: (id: number) => adminApi.ban(id),   onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }) });
  const unbanMutation = useMutation({ mutationFn: (id: number) => adminApi.unban(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }) });

  const list: any[] = apiResult?.data ?? []; // eslint-disable-line @typescript-eslint/no-explicit-any
  const total = apiResult?.meta?.total ?? list.length;

  const stats = {
    total,
    active:    list.filter((u: any) => !u.banned_at).length, // eslint-disable-line @typescript-eslint/no-explicit-any
    customers: list.filter((u: any) => u.role === 'customer').length, // eslint-disable-line @typescript-eslint/no-explicit-any
    vendors:   list.filter((u: any) => u.role === 'vendor').length, // eslint-disable-line @typescript-eslint/no-explicit-any
  };

  const roleChipStyle = (r: string) => {
    if (r === 'vendor') return { background: 'var(--primary-50)', color: 'var(--primary-700)' };
    if (r === 'admin')  return { background: '#EEF2FF', color: '#4338CA' };
    return { background: 'var(--bg-3)', color: 'var(--ink-2)' };
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 style={{ fontSize: 32 }}>Users</h1>
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="plus" size={14} /> Invite user
        </button>
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
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="filter" size={14} /> Filters
          </button>
        </div>

        <table className="tbl">
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
              <th>Name</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
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
                <tr key={u.id}>
                  <td><input type="checkbox" /></td>
                  <td>
                    <div className="flex items-center gap-10">
                      <div style={{ width: 32, height: 32, borderRadius: 999, background: 'var(--primary-50)', color: 'var(--primary-700)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                        {name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="fw-600 text-14">{name}</div>
                        <div className="muted text-12">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="chip" style={{ ...roleChipStyle(u.role), textTransform: 'capitalize', fontSize: 11 }}>{u.role}</span>
                  </td>
                  <td className="muted text-13">{joined}</td>
                  <td>
                    <span className="chip" style={!isBanned
                      ? { background: '#E6F7F0', color: '#059669', fontSize: 11 }
                      : { background: '#FFF0F0', color: '#E11D48', fontSize: 11 }}>
                      {isBanned ? 'banned' : 'active'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="flex gap-6" style={{ justifyContent: 'flex-end' }}>
                      {!isBanned ? (
                        <button className="btn btn-ghost btn-sm" style={{ color: '#E11D48' }}
                          onClick={() => banMutation.mutate(u.id)}>Ban</button>
                      ) : (
                        <button className="btn btn-ghost btn-sm"
                          onClick={() => unbanMutation.mutate(u.id)}>Unban</button>
                      )}
                      <button className="btn btn-ghost btn-sm">View</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="flex items-center justify-between" style={{ padding: '12px 18px' }}>
          <span className="muted text-13">Showing {list.length} of {total} users</span>
          <div className="flex gap-6">
            <button className="btn btn-ghost btn-sm">Prev</button>
            <button className="btn btn-soft btn-sm">1</button>
            <button className="btn btn-ghost btn-sm">2</button>
            <button className="btn btn-ghost btn-sm">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Services
function AdminServices() {
  const user = useAuthUser();
  const { data: apiResult, isLoading } = useQuery({
    queryKey: ['admin-services'],
    queryFn: () => adminApi.services(),
    enabled: !!user,
    staleTime: 60_000,
  });
  const qc = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteService(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-services'] }),
  });

  const services: any[] = apiResult?.data ?? []; // eslint-disable-line @typescript-eslint/no-explicit-any

  const sk = { height: 14, borderRadius: 6, background: 'linear-gradient(90deg,var(--bg-3) 25%,var(--bg-2) 50%,var(--bg-3) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' } as const;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 style={{ fontSize: 32 }}>Services</h1>
        <div className="flex gap-10">
          <button className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="download" size={14} /> Export
          </button>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="plus" size={14} /> New service
          </button>
        </div>
      </div>

      <div className="card mt-20" style={{ overflow: 'hidden' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th></th>
              <th>Service</th>
              <th>Vendor</th>
              <th>Category</th>
              <th>Location</th>
              <th>Price</th>
              <th>Rating</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [1,2,3,4].map((i) => (
                <tr key={i}>
                  <td><div style={{ ...sk, width: 56, height: 40, borderRadius: 8 }} /></td>
                  <td><div style={{ ...sk, width: 140 }} /></td>
                  <td><div style={{ ...sk, width: 100 }} /></td>
                  <td><div style={{ ...sk, width: 80 }} /></td>
                  <td><div style={{ ...sk, width: 80 }} /></td>
                  <td><div style={{ ...sk, width: 60 }} /></td>
                  <td><div style={{ ...sk, width: 40 }} /></td>
                  <td><div style={{ ...sk, width: 50 }} /></td>
                  <td></td>
                </tr>
              ))
            ) : services.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>No services yet.</td></tr>
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
                  <td>{img && <img src={img} alt="" style={{ width: 56, height: 40, borderRadius: 8, objectFit: 'cover' }} />}</td>
                  <td className="fw-600">{s.title}</td>
                  <td className="muted text-13">{vendorName}</td>
                  <td><span className="chip chip-soft" style={{ fontSize: 11 }}>{catName}</span></td>
                  <td className="muted text-13">{s.location}</td>
                  <td className="fw-700">€{Number(s.minimum_price).toLocaleString()}</td>
                  <td>
                    <div className="flex items-center gap-4">
                      <Icon name="star" size={12} color="#F7C24A" />
                      <span className="fw-600 text-13">{Number(s.rating).toFixed(1)}</span>
                    </div>
                  </td>
                  <td>
                    <span className="chip" style={{ background: status === 'active' ? '#E6F7F0' : '#FFF7E6', color: status === 'active' ? '#059669' : '#D97706', fontSize: 11 }}>{status}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-ghost btn-sm"><Icon name="eye" size={12} /></button>
                    <button className="btn btn-ghost btn-sm" style={{ color: '#E11D48' }}
                      onClick={() => deleteMutation.mutate(s.id)}><Icon name="trash" size={12} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
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
        <div className="grid mt-20" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
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
        <div className="grid mt-20" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
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

interface AdminProps {
  sub?: string;
}

// ─── Main dashboard shell
export default function AdminDashboard({ sub: subProp }: AdminProps) {
  const pageProps = usePage().props as AdminProps;
  const sub = subProp ?? pageProps.sub ?? 'users';
  const active = sub || 'users';
  const user = useAuthUser();

  useEffect(() => {
    if (!user) router.visit('/auth', { replace: true });
  }, [user]);

  useEffect(() => {
    document.title = 'Admin Dashboard | WedBox';
    return () => { document.title = 'WedBox'; };
  }, []);

  if (!user) return null;

  return (
    <div className="dash-shell">
      <AdminSidebar active={active} />
      <main className="dash-main">
        {(active === 'users')    && <AdminUsers />}
        {active === 'services'   && <AdminServices />}
        {active === 'blog'       && <AdminBlog />}
      </main>
    </div>
  );
}
