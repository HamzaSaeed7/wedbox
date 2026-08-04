import React, { useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { vendorOnboardingApi } from '../../lib/api';
import { useAuthUser, useStore } from '../../store';
import ToastStack from '../../components/shared/Toast';

interface Category { id: number; name: string; }
interface City     { id: number; name: string; }

interface Props {
  categories: Category[];
  cities: City[];
}

const COUNTRIES = ['Cyprus'];

const PHONE_CODES = [
  { code: '+357', flag: '🇨🇾', country: 'CY' },
  { code: '+30',  flag: '🇬🇷', country: 'GR' },
  { code: '+44',  flag: '🇬🇧', country: 'GB' },
  { code: '+49',  flag: '🇩🇪', country: 'DE' },
  { code: '+33',  flag: '🇫🇷', country: 'FR' },
  { code: '+1',   flag: '🇺🇸', country: 'US' },
  { code: '+7',   flag: '🇷🇺', country: 'RU' },
  { code: '+971', flag: '🇦🇪', country: 'AE' },
];

// Expected national-number digit counts for the supported dialling codes
const PHONE_DIGITS: Record<string, number> = {
  '+357': 8, '+30': 10, '+44': 10, '+49': 11, '+33': 9, '+1': 10, '+7': 10, '+971': 9,
};

// Returns an error message for an invalid phone number, or '' when valid/empty (phone is optional)
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

export default function VendorOnboarding({ categories, cities }: Props) {
  const user = useAuthUser();
  const { logout, showToast } = useStore();

  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    business_name:        '',
    business_description: '',
    category_id:          '' as string | number,
    address1:             '',
    address2:             '',
    country:              'Cyprus',
    city:                 '',
    phoneCode:            '+357',
    phoneNumber:          '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // ── Shared field styling ─────────────────────────────────────────────────────
  const labelCls = 'block text-xs font-semibold text-gray-600 mb-1.5';
  const inputCls = (err?: string) =>
    `w-full rounded-xl border bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 transition focus:outline-none focus:ring-2 focus:ring-[#38b2ac]/40 focus:border-[#38b2ac] ${
      err ? 'border-red-400 bg-red-50/50' : 'border-gray-200'
    }`;

  // ── Avatar upload ──────────────────────────────────────────────────────────

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const { url } = await vendorOnboardingApi.uploadAvatar(file);
      setAvatarUrl(url);
    } catch {
      showToast('Avatar upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!form.business_name.trim()) newErrors.business_name = 'Business name is required.';
    if (!form.category_id) newErrors.category_id = 'Please select a category.';
    const phoneErr = phoneError(form.phoneCode, form.phoneNumber);
    if (phoneErr) newErrors.phone = phoneErr;

    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setSaving(true);
    try {
      await vendorOnboardingApi.complete({
        business_name:        form.business_name,
        business_description: form.business_description || undefined,
        category_id:          Number(form.category_id),
        address1:             form.address1 || undefined,
        address2:             form.address2 || undefined,
        country:              form.country  || undefined,
        city:                 form.city     || undefined,
        phone:                form.phoneCode + ' ' + form.phoneNumber || undefined,
        avatar_url:           avatarUrl     || undefined,
      });
      showToast('Welcome to Wedbi! 🎉', 'success');
      router.visit('/dashboard/vendor');
    } catch (err: unknown) {
      const resp = (err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } })?.response?.data;
      if (resp?.errors) {
        const mapped: Record<string, string> = {};
        Object.entries(resp.errors).forEach(([k, v]) => { mapped[k] = v[0]; });
        setErrors(mapped);
      } else {
        showToast(resp?.message ?? 'Could not save. Please try again.', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#38b2ac] via-[#34a8a3] to-[#2c7a7b] flex items-center justify-center p-4 sm:p-6">
      {/* Toast notifications */}
      <ToastStack />

      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl p-6 sm:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#38b2ac]/10 mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38b2ac" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6-6 6 6-6 12z" /><path d="M6 9h12" />
            </svg>
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#38b2ac] mb-1">Vendor setup</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome to Wedbi</h1>
          <p className="text-gray-500 text-sm mt-1.5">Tell us about your business to get started.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="group relative w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden shrink-0 hover:border-[#38b2ac] transition"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="flex flex-col items-center text-gray-400 group-hover:text-[#38b2ac] transition">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
                  </svg>
                  <span className="text-[10px] mt-1 leading-none">{uploading ? 'Uploading…' : 'Add photo'}</span>
                </span>
              )}
              {avatarUrl && !uploading && (
                <span className="absolute bottom-0.5 right-0.5 w-5 h-5 rounded-full bg-[#38b2ac] border-2 border-white grid place-items-center">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                </span>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            <div>
              <p className="text-sm font-medium text-gray-800">Profile picture</p>
              <p className="text-xs text-gray-500 mt-0.5">PNG or JPG — shown on your public profile.</p>
            </div>
          </div>

          {/* Email (read-only) */}
          <div>
            <label className={labelCls}>Email</label>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-xl text-gray-500 text-sm">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 5L2 7" /></svg>
              <span className="truncate">{user?.email ?? ''}</span>
            </div>
          </div>

          {/* ── Section: Business ── */}
          <div className="pt-1">
            <div className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38b2ac]" /> Business details
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>
                  Category <span className="text-red-500 font-normal normal-case">· can't be changed later</span>
                </label>
                <select
                  value={form.category_id}
                  onChange={(e) => set('category_id', e.target.value)}
                  className={inputCls(errors.category_id)}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id}</p>}
              </div>

              <div>
                <label className={labelCls}>Business name</label>
                <input
                  type="text"
                  value={form.business_name}
                  onChange={(e) => set('business_name', e.target.value)}
                  placeholder="e.g. Elysian Gardens"
                  className={inputCls(errors.business_name)}
                />
                {errors.business_name && <p className="text-red-500 text-xs mt-1">{errors.business_name}</p>}
              </div>
            </div>

            <div className="mt-4">
              <label className={labelCls}>Business description</label>
              <textarea
                rows={3}
                value={form.business_description}
                onChange={(e) => set('business_description', e.target.value)}
                placeholder="Tell couples what makes your service special…"
                className={`${inputCls()} resize-none`}
              />
            </div>
          </div>

          {/* ── Section: Location & contact ── */}
          <div className="pt-1">
            <div className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38b2ac]" /> Location &amp; contact
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelCls}>Address line 1</label>
                <input type="text" value={form.address1} onChange={(e) => set('address1', e.target.value)} className={inputCls()} />
              </div>
              <div>
                <label className={labelCls}>Address line 2 <span className="text-gray-400 font-normal normal-case">(optional)</span></label>
                <input type="text" value={form.address2} onChange={(e) => set('address2', e.target.value)} className={inputCls()} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Country</label>
                  <select value={form.country} onChange={(e) => set('country', e.target.value)} className={inputCls()}>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>City</label>
                  {cities.length > 0 ? (
                    <select value={form.city} onChange={(e) => set('city', e.target.value)} className={inputCls()}>
                      <option value="">Select city</option>
                      {cities.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input type="text" value={form.city} onChange={(e) => set('city', e.target.value)} className={inputCls()} />
                  )}
                </div>
              </div>

              {/* Phone */}
              {(() => {
                const livePhoneErr = errors.phone || phoneError(form.phoneCode, form.phoneNumber);
                return (
                  <div>
                    <label className={labelCls}>Phone</label>
                    <div className={`flex rounded-xl border bg-gray-50 overflow-hidden transition focus-within:ring-2 focus-within:ring-[#38b2ac]/40 focus-within:border-[#38b2ac] ${
                      livePhoneErr ? 'border-red-400 bg-red-50/50' : 'border-gray-200'
                    }`}>
                      <select
                        value={form.phoneCode}
                        onChange={(e) => set('phoneCode', e.target.value)}
                        className="bg-gray-100 border-r border-gray-200 px-3 py-2.5 text-sm text-gray-700 focus:outline-none"
                      >
                        {PHONE_CODES.map((p) => (
                          <option key={p.code} value={p.code}>{p.flag} {p.code}</option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        inputMode="numeric"
                        value={form.phoneNumber}
                        onChange={(e) => set('phoneNumber', e.target.value.replace(/[^\d]/g, ''))}
                        placeholder="96123456"
                        className="flex-1 bg-transparent px-4 py-2.5 text-sm focus:outline-none"
                      />
                    </div>
                    {livePhoneErr && <p className="text-xs text-red-500 mt-1">{livePhoneErr}</p>}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => logout()}
              className="px-5 py-3 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 active:scale-95 transition"
            >
              Logout
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className={`flex-1 py-3 rounded-xl font-semibold text-white shadow-sm transition ${
                saving || uploading
                  ? 'bg-[#38b2ac]/60 cursor-not-allowed'
                  : 'bg-[#38b2ac] hover:bg-[#2c9c96] active:scale-95'
              }`}
            >
              {saving ? 'Saving…' : 'Complete setup'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
