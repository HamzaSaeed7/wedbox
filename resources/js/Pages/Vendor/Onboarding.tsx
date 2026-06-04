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
      showToast('Welcome to WedBox! 🎉', 'success');
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
    <div className="min-h-screen bg-[#38b2ac] flex items-center justify-center p-4">
      {/* Toast notifications */}
      <ToastStack />

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-1">Welcome to WedBox</h1>
        <p className="text-center text-gray-500 text-sm mb-7">Enter your details to get Started</p>

        <form onSubmit={handleSubmit} noValidate>
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden shrink-0 hover:border-[#38b2ac] transition"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400 text-xs text-center px-1 leading-tight">
                  {uploading ? 'Uploading…' : 'Click to upload an image'}
                </span>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <span className="text-gray-600 text-sm">Upload your Profile picture</span>
          </div>

          {/* Email (read-only) */}
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div className="mb-5 px-4 py-3 bg-gray-100 rounded-full text-gray-500 text-sm">
            {user?.email ?? ''}
          </div>

          {/* Category + Business Name */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category:{' '}
                <span className="text-red-500 font-normal text-xs">Select carefully, it can't be changed</span>
              </label>
              <select
                value={form.category_id}
                onChange={(e) => set('category_id', e.target.value)}
                className={`w-full border rounded-full px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#38b2ac] ${
                  errors.category_id ? 'border-red-400' : 'border-gray-300'
                }`}
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id}</p>}
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
              <input
                type="text"
                value={form.business_name}
                onChange={(e) => set('business_name', e.target.value)}
                className={`w-full border rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#38b2ac] ${
                  errors.business_name ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errors.business_name && <p className="text-red-500 text-xs mt-1">{errors.business_name}</p>}
            </div>
          </div>

          {/* Business Description */}
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Description:</label>
          <textarea
            rows={3}
            value={form.business_description}
            onChange={(e) => set('business_description', e.target.value)}
            className="w-full border border-gray-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#38b2ac] resize-none mb-4"
          />

          {/* Address 1 */}
          <label className="block text-sm font-medium text-gray-700 mb-1">Address 1:</label>
          <input
            type="text"
            value={form.address1}
            onChange={(e) => set('address1', e.target.value)}
            className="w-full border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#38b2ac] mb-4"
          />

          {/* Address 2 */}
          <label className="block text-sm font-medium text-gray-700 mb-1">Address 2: <span className="text-gray-400 font-normal">(Optional)</span></label>
          <input
            type="text"
            value={form.address2}
            onChange={(e) => set('address2', e.target.value)}
            className="w-full border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#38b2ac] mb-4"
          />

          {/* Country + City */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Country:</label>
              <select
                value={form.country}
                onChange={(e) => set('country', e.target.value)}
                className="w-full border border-gray-300 rounded-full px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#38b2ac]"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">City:</label>
              {cities.length > 0 ? (
                <select
                  value={form.city}
                  onChange={(e) => set('city', e.target.value)}
                  className="w-full border border-gray-300 rounded-full px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#38b2ac]"
                >
                  <option value=""></option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => set('city', e.target.value)}
                  className="w-full border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#38b2ac]"
                />
              )}
            </div>
          </div>

          {/* Phone */}
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone:</label>
          <div className={`flex border rounded-full overflow-hidden focus-within:ring-2 focus-within:ring-[#38b2ac] mb-6 ${
            errors.phone ? 'border-red-400' : 'border-gray-300'
          }`}>
            <select
              value={form.phoneCode}
              onChange={(e) => set('phoneCode', e.target.value)}
              className="bg-gray-50 border-r border-gray-300 px-3 py-2.5 text-sm text-gray-700 focus:outline-none"
            >
              {PHONE_CODES.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.flag} {p.code}
                </option>
              ))}
            </select>
            <input
              type="tel"
              value={form.phoneNumber}
              onChange={(e) => set('phoneNumber', e.target.value)}
              placeholder="96 123456"
              className="flex-1 px-4 py-2.5 text-sm focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving || uploading}
              className={`flex-1 py-3 rounded-full font-semibold text-white transition ${
                saving || uploading
                  ? 'bg-[#38b2ac]/60 cursor-not-allowed'
                  : 'bg-[#38b2ac] hover:bg-[#2c9c96] active:scale-95'
              }`}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => logout()}
              className="flex-1 py-3 rounded-full font-semibold text-white bg-[#38b2ac] hover:bg-[#2c9c96] active:scale-95 transition"
            >
              Logout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
