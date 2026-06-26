/**
 * VendorSetupPanel
 * Full-screen admin overlay to complete a vendor's onboarding profile and build
 * out their service + per-category details on their behalf — subscription gate
 * bypassed. Reuses ServiceSubdataEditor and the vendor onboarding form fields.
 */
import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, uploadApi } from '../../lib/api';
import { useStore } from '../../store';
import Icon from '../shared/Icon';
import CurrencyInput from '../shared/CurrencyInput';
import ServiceSubdataEditor from '../vendor/ServiceSubdataEditor';

interface Props {
  vendorId: number;
  onClose: () => void;
}

const COUNTRIES = ['Cyprus'];

const PHONE_CODES = [
  { code: '+357', flag: '🇨🇾' }, { code: '+30', flag: '🇬🇷' }, { code: '+44', flag: '🇬🇧' },
  { code: '+49', flag: '🇩🇪' }, { code: '+33', flag: '🇫🇷' }, { code: '+1', flag: '🇺🇸' },
  { code: '+7', flag: '🇷🇺' }, { code: '+971', flag: '🇦🇪' },
];

const PHONE_DIGITS: Record<string, number> = {
  '+357': 8, '+30': 10, '+44': 10, '+49': 11, '+33': 9, '+1': 10, '+7': 10, '+971': 9,
};

function phoneError(code: string, number: string): string {
  const cleaned = number.trim();
  if (!cleaned) return '';
  if (!/^[\d\s-]+$/.test(cleaned)) return 'Phone number can only contain digits.';
  const digits = cleaned.replace(/\D/g, '');
  const expected = PHONE_DIGITS[code];
  if (expected) {
    if (digits.length !== expected) return `Enter a valid ${expected}-digit number for ${code}.`;
  } else if (digits.length < 6 || digits.length > 15) {
    return 'Enter a valid phone number.';
  }
  return '';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = any;

// Turn a failed image upload into a clear, human message. Covers the common
// cases: wrong file type, too large (server 422 `max` rule or PHP 413), and
// network/other failures.
function uploadErrorMessage(err: AnyObj, maxMb: number): string {
  const resp = err?.response;
  if (resp?.status === 413) return `Image is too large — keep it under ${maxMb} MB.`;
  const first: string | undefined = resp?.data?.errors?.file?.[0];
  if (first) {
    if (/image/i.test(first)) return 'That file isn’t a supported image (use JPG, PNG or WEBP).';
    if (/great|kilobyte|\bmax\b|size/i.test(first)) return `Image is too large — keep it under ${maxMb} MB.`;
    return first;
  }
  if (resp?.data?.message) return resp.data.message;
  return 'Upload failed — please check your connection and try again.';
}

// Quick client-side guard so obvious mistakes fail instantly without a round
// trip. Size isn't checked here because images are downscaled before sending.
function imageTypeError(file: File): string {
  if (!file.type.startsWith('image/')) return 'Please choose an image file (JPG, PNG or WEBP).';
  return '';
}

export default function VendorSetupPanel({ vendorId, onClose }: Props) {
  const qc = useQueryClient();
  const showToast = useStore((s) => s.showToast);
  const [tab, setTab] = useState<'onboarding' | 'service' | 'details'>('onboarding');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-vendor-setup', vendorId],
    queryFn: () => adminApi.vendorSetup(vendorId),
  });

  const profile: AnyObj = data?.profile ?? null;
  const categories: AnyObj[] = data?.categories ?? [];
  const cities: AnyObj[] = data?.cities ?? [];
  const services: AnyObj[] = data?.services ?? [];
  const service: AnyObj = services[0] ?? null;
  const hasService = !!service;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1200, display: 'flex', alignItems: 'stretch', justifyContent: 'center', padding: 16, overflow: 'auto' }}>
      <div className="card" style={{ width: 760, maxWidth: '100%', margin: 'auto', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 32px)' }}>
        {/* Header */}
        <div className="flex items-center justify-between" style={{ padding: '18px 24px', borderBottom: '1px solid var(--line)' }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>Vendor setup</h2>
            <p className="muted text-13 mt-2">{profile?.business_name || 'Configure this vendor on their behalf'}</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close"><Icon name="close" size={16} /></button>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ padding: '0 24px', borderBottom: '1px solid var(--line)' }}>
          {([['onboarding', 'Onboarding'], ['service', 'Service'], ['details', 'Service details']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`tab ${tab === key ? 'tab-active' : ''}`}
              style={{ background: 'transparent', border: 0 }}>{label}</button>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: 24, overflow: 'auto' }}>
          {isLoading ? (
            <div className="muted text-14 py-20" style={{ textAlign: 'center' }}>Loading vendor…</div>
          ) : (
            <>
              {tab === 'onboarding' && (
                <OnboardingTab vendorId={vendorId} profile={profile} categories={categories} cities={cities} hasService={hasService}
                  onSaved={() => qc.invalidateQueries({ queryKey: ['admin-vendor-setup', vendorId] })} />
              )}
              {tab === 'service' && (
                <ServiceTab vendorId={vendorId} profile={profile} categories={categories} service={service}
                  onSaved={() => qc.invalidateQueries({ queryKey: ['admin-vendor-setup', vendorId] })} />
              )}
              {tab === 'details' && (
                hasService
                  ? <SubdataTab service={service} onSaved={() => qc.invalidateQueries({ queryKey: ['admin-vendor-setup', vendorId] })} />
                  : <div className="muted text-14">Create a service first (in the <strong>Service</strong> tab) before configuring its details.</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Onboarding tab ──────────────────────────────────────────────────────────
function OnboardingTab({ vendorId, profile, categories, cities, hasService, onSaved }: {
  vendorId: number; profile: AnyObj; categories: AnyObj[]; cities: AnyObj[]; hasService: boolean; onSaved: () => void;
}) {
  const showToast = useStore((s) => s.showToast);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  // Split a stored "+357 96123456" phone into code + number
  const parsePhone = (raw?: string | null) => {
    const v = (raw ?? '').trim();
    const match = PHONE_CODES.find((p) => v.startsWith(p.code));
    if (match) return { phoneCode: match.code, phoneNumber: v.slice(match.code.length).replace(/\D/g, '') };
    return { phoneCode: '+357', phoneNumber: v.replace(/\D/g, '') };
  };

  const [form, setForm] = useState({
    business_name: '', business_description: '', category_id: '' as string | number,
    address1: '', address2: '', country: 'Cyprus', city: '', phoneCode: '+357', phoneNumber: '', avatar_url: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const { phoneCode, phoneNumber } = parsePhone(profile?.phone);
    setForm({
      business_name: profile?.business_name ?? '',
      business_description: profile?.business_description ?? '',
      category_id: profile?.category_id ?? '',
      address1: profile?.address1 ?? '', address2: profile?.address2 ?? '',
      country: profile?.country ?? 'Cyprus', city: profile?.city ?? '',
      phoneCode, phoneNumber, avatar_url: profile?.avatar_url ?? '',
    });
  }, [profile]);

  const set = (k: string, v: string | number) => setForm((p) => ({ ...p, [k]: v }));

  const mut = useMutation({
    mutationFn: (d: object) => adminApi.saveVendorOnboarding(vendorId, d),
    onSuccess: () => { showToast('Onboarding saved.', 'success'); onSaved(); },
    onError: (err: AnyObj) => {
      const resp = err?.response?.data;
      if (resp?.errors) {
        const mapped: Record<string, string> = {};
        Object.entries(resp.errors).forEach(([k, v]) => { mapped[k] = (v as string[])[0]; });
        setErrors(mapped);
      } else showToast(resp?.message ?? 'Could not save.', 'error');
    },
  });

  const handleSave = () => {
    setErrors({});
    const e: Record<string, string> = {};
    if (!form.business_name.trim()) e.business_name = 'Business name is required.';
    if (!form.category_id) e.category_id = 'Please select a category.';
    const pe = phoneError(form.phoneCode, form.phoneNumber);
    if (pe) e.phone = pe;
    if (Object.keys(e).length) { setErrors(e); return; }

    mut.mutate({
      business_name: form.business_name,
      business_description: form.business_description || undefined,
      category_id: Number(form.category_id),
      address1: form.address1 || undefined, address2: form.address2 || undefined,
      country: form.country || undefined, city: form.city || undefined,
      phone: form.phoneNumber ? `${form.phoneCode} ${form.phoneNumber}` : undefined,
      avatar_url: form.avatar_url || undefined,
    });
  };

  const handleAvatar = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    ev.target.value = '';
    setAvatarError('');
    const typeErr = imageTypeError(file);
    if (typeErr) { setAvatarError(typeErr); return; }
    setUploading(true);
    try { set('avatar_url', await uploadApi.avatar(file)); }
    catch (err) { setAvatarError(uploadErrorMessage(err, 5)); }
    finally { setUploading(false); }
  };

  const livePhoneErr = errors.phone || phoneError(form.phoneCode, form.phoneNumber);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Avatar */}
      <div className="flex items-center gap-12">
        <button type="button" onClick={() => fileRef.current?.click()}
          style={{ width: 72, height: 72, borderRadius: 999, border: '2px dashed var(--line)', display: 'grid', placeItems: 'center', overflow: 'hidden', cursor: 'pointer', background: 'var(--bg-2)', flexShrink: 0 }}>
          {form.avatar_url ? <img src={form.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span className="muted text-11">{uploading ? 'Uploading…' : 'Add photo'}</span>}
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} style={{ display: 'none' }} />
        <div>
          <div className="fw-600 text-14">Profile picture</div>
          <div className="muted text-12 mt-2">Shown on the vendor's public profile.</div>
          {avatarError && <div className="text-12 mt-4" style={{ color: '#E11D48' }}>{avatarError}</div>}
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label className="field-label">Category {hasService && <span className="muted text-11">· locked once a service exists</span>}</label>
          <select className="input mt-8" value={form.category_id} disabled={hasService}
            onChange={(e) => set('category_id', e.target.value)} style={hasService ? { opacity: 0.6 } : undefined}>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors.category_id && <p className="text-12 mt-4" style={{ color: '#E11D48' }}>{errors.category_id}</p>}
        </div>
        <div>
          <label className="field-label">Business name</label>
          <input className="input mt-8" value={form.business_name} onChange={(e) => set('business_name', e.target.value)} placeholder="e.g. Elysian Gardens" />
          {errors.business_name && <p className="text-12 mt-4" style={{ color: '#E11D48' }}>{errors.business_name}</p>}
        </div>
      </div>

      <div>
        <label className="field-label">Business description</label>
        <textarea className="textarea mt-8" rows={3} value={form.business_description} onChange={(e) => set('business_description', e.target.value)} />
      </div>

      <div>
        <label className="field-label">Address line 1</label>
        <input className="input mt-8" value={form.address1} onChange={(e) => set('address1', e.target.value)} />
      </div>
      <div>
        <label className="field-label">Address line 2 <span className="muted text-11">(optional)</span></label>
        <input className="input mt-8" value={form.address2} onChange={(e) => set('address2', e.target.value)} />
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label className="field-label">Country</label>
          <select className="input mt-8" value={form.country} onChange={(e) => set('country', e.target.value)}>
            {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">City</label>
          {cities.length > 0 ? (
            <select className="input mt-8" value={form.city} onChange={(e) => set('city', e.target.value)}>
              <option value="">Select city</option>
              {cities.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          ) : (
            <input className="input mt-8" value={form.city} onChange={(e) => set('city', e.target.value)} />
          )}
        </div>
      </div>

      <div>
        <label className="field-label">Phone</label>
        <div className="flex mt-8" style={{ gap: 8 }}>
          <select className="input" style={{ width: 110 }} value={form.phoneCode} onChange={(e) => set('phoneCode', e.target.value)}>
            {PHONE_CODES.map((p) => <option key={p.code} value={p.code}>{p.flag} {p.code}</option>)}
          </select>
          <input className="input" style={{ flex: 1 }} type="tel" inputMode="numeric" placeholder="96123456"
            value={form.phoneNumber} onChange={(e) => set('phoneNumber', e.target.value.replace(/\D/g, ''))} />
        </div>
        {livePhoneErr && <p className="text-12 mt-4" style={{ color: '#E11D48' }}>{livePhoneErr}</p>}
      </div>

      <div className="flex" style={{ justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={handleSave} disabled={mut.isPending} style={{ minWidth: 140 }}>
          {mut.isPending ? 'Saving…' : 'Save onboarding'}
        </button>
      </div>
    </div>
  );
}

// ─── Service tab ─────────────────────────────────────────────────────────────
function ServiceTab({ vendorId, profile, categories, service, onSaved }: {
  vendorId: number; profile: AnyObj; categories: AnyObj[]; service: AnyObj; onSaved: () => void;
}) {
  const showToast = useStore((s) => s.showToast);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState('');

  useEffect(() => {
    setTitle(service?.title ?? '');
    setLocation(service?.location ?? '');
    setPrice(service?.minimum_price != null ? String(service.minimum_price) : '');
    setDescription(service?.description ?? '');
    setImages(Array.isArray(service?.images) ? service.images : []);
  }, [service?.id]);

  const createMut = useMutation({
    mutationFn: (d: object) => adminApi.createVendorService(vendorId, d),
    onSuccess: () => { showToast('Service created.', 'success'); onSaved(); },
    onError: () => showToast('Could not create service.', 'error'),
  });

  const updateMut = useMutation({
    mutationFn: (d: object) => adminApi.updateVendorService(service.id, d),
    onSuccess: () => { showToast('Service saved.', 'success'); onSaved(); },
    onError: () => showToast('Could not save service.', 'error'),
  });

  if (!service) {
    const categoryId = profile?.category_id;
    const catName = categories.find((c) => c.id === categoryId)?.name;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {profile?.onboarding_completed && categoryId ? (
          <>
            <p className="muted text-14">No service exists yet. Create one from the onboarding category{catName ? ` (${catName})` : ''} to continue.</p>
            <div>
              <button className="btn btn-primary" disabled={createMut.isPending}
                onClick={() => createMut.mutate({ category_id: categoryId, title: profile.business_name || 'New service', description: profile.business_description ?? undefined, location: profile.city ?? profile.address1 ?? undefined, minimum_price: 0, images: [] })}>
                {createMut.isPending ? 'Creating…' : 'Create service'}
              </button>
            </div>
          </>
        ) : (
          <p className="muted text-14">Complete the <strong>Onboarding</strong> tab first (business name + category) to create the service.</p>
        )}
      </div>
    );
  }

  const isPublished = service.status === 'active';

  const persistImages = (next: string[]) => {
    setImages(next);
    adminApi.updateVendorService(service.id, { images: next }).then(onSaved).catch(() => showToast('Could not update images.', 'error'));
  };

  const handleUpload = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    ev.target.value = '';
    setImageError('');
    const typeErr = imageTypeError(file);
    if (typeErr) { setImageError(typeErr); return; }
    setUploading(true);
    try { persistImages([...images, await uploadApi.serviceImage(file)]); }
    catch (err) { setImageError(uploadErrorMessage(err, 10)); }
    finally { setUploading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="flex items-center justify-between">
        <span className="chip" style={{ background: isPublished ? '#E6F7F0' : 'var(--bg-3)', color: isPublished ? '#059669' : 'var(--ink-2)', fontSize: 11 }}>
          {isPublished ? 'Published' : 'Draft / Unpublished'}
        </span>
        {isPublished
          ? <button className="btn btn-ghost btn-sm" style={{ color: '#E11D48' }} disabled={updateMut.isPending} onClick={() => updateMut.mutate({ status: 'inactive' })}>Unpublish</button>
          : <button className="btn btn-primary btn-sm" style={{ background: '#059669', borderColor: '#059669' }} disabled={updateMut.isPending} onClick={() => updateMut.mutate({ status: 'active' })}>
              {updateMut.isPending ? 'Publishing…' : 'Publish'}
            </button>}
      </div>

      <div>
        <label className="field-label">Service title</label>
        <input className="input mt-8" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="flex" style={{ gap: 12 }}>
        <div style={{ flex: 1 }}>
          <label className="field-label">Location</label>
          <input className="input mt-8" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div style={{ width: 160 }}>
          <label className="field-label">Min. price (€)</label>
          <CurrencyInput className="input mt-8" value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="field-label">Images <span className="muted text-12">(minimum 2 to publish)</span></label>
        <div className="dash-img-4 mt-8">
          {images.map((im, i) => (
            <div key={i} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 12, overflow: 'hidden' }}>
              <img src={im} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button type="button" onClick={() => persistImages(images.filter((_, j) => j !== i))}
                style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 999, background: 'rgba(0,0,0,0.55)', border: 0, color: 'white', cursor: 'pointer', display: 'grid', placeItems: 'center', lineHeight: 1 }}>
                <Icon name="close" size={10} color="white" />
              </button>
            </div>
          ))}
          <label style={{ aspectRatio: '1/1', borderRadius: 12, border: '2px dashed var(--line)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, textAlign: 'center', cursor: uploading ? 'wait' : 'pointer', color: 'var(--muted)', opacity: uploading ? 0.6 : 1 }}>
            {uploading ? <div className="text-11">Uploading…</div> : <><Icon name="plus" size={20} /><div className="text-11">Add photo</div></>}
            <input type="file" style={{ display: 'none' }} accept="image/*" disabled={uploading} onChange={handleUpload} />
          </label>
        </div>
        {imageError && <p className="text-12 mt-8" style={{ color: '#E11D48' }}>{imageError}</p>}
      </div>

      <div>
        <label className="field-label">Description</label>
        <textarea className="textarea mt-8" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="flex" style={{ justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" disabled={updateMut.isPending} style={{ minWidth: 140 }}
          onClick={() => updateMut.mutate({ title, location, minimum_price: price === '' ? 0 : Number(price), description })}>
          {updateMut.isPending ? 'Saving…' : 'Save service'}
        </button>
      </div>
    </div>
  );
}

// ─── Service details tab ─────────────────────────────────────────────────────
function SubdataTab({ service, onSaved }: { service: AnyObj; onSaved: () => void }) {
  const showToast = useStore((s) => s.showToast);
  const mut = useMutation({
    mutationFn: (d: object) => adminApi.updateVendorSubdata(service.id, d),
    onSuccess: () => { showToast('Service details saved.', 'success'); onSaved(); },
    onError: () => showToast('Could not save details.', 'error'),
  });
  return <ServiceSubdataEditor service={service} onSave={(d) => mut.mutate(d)} isSaving={mut.isPending} />;
}
