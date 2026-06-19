import React, { useState, useEffect } from 'react';
import PublicLayout from '../../Layouts/PublicLayout';
import { vendorOnboardingApi } from '../../lib/api';
import { useStore } from '../../store';

const PLANS = [
  {
    id: '3month' as const,
    name: 'Starter',
    price: '€57',
    period: '3 months',
    perMonth: '€19/mo',
    tagline: 'Perfect to get started and test the market.',
    badge: null,
    savingBadge: null,
    features: [
      'Full vendor profile',
      'Professional setup by WedBox',
      'Unlimited listings',
      'Direct booking enquiries',
      'No commission on bookings',
    ],
    highlight: false,
    cta: 'Get started',
  },
  {
    id: '12month' as const,
    name: 'Growth',
    price: '€190',
    period: 'per year',
    perMonth: '~€16/mo',
    tagline: 'Built for vendors serious about long-term growth.',
    badge: 'Most Popular',
    savingBadge: 'Save €38 vs monthly',
    features: [
      'Everything in Starter',
      'Priority search visibility',
      'Trusted Vendor badge',
      'Social media feature opportunity',
      'Dedicated account support',
    ],
    highlight: true,
    cta: 'Get the best deal',
  },
];

const TRUST_STATS = [
  { value: '500+', label: 'vendors listed' },
  { value: '3 000+', label: 'couples served' },
  { value: '0%', label: 'commission' },
  { value: '24 h', label: 'setup time' },
];

const FAQS = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. You can cancel your subscription at any time from your dashboard. Your listing stays live until the billing period ends.',
  },
  {
    q: 'Are there any hidden fees?',
    a: 'None. WedBox charges a flat subscription fee and takes zero commission on bookings or enquiries.',
  },
  {
    q: 'How quickly will my profile go live?',
    a: 'Our team sets up your profile professionally within 24 hours of payment.',
  },
];

export default function VendorPricing() {
  const [loading, setLoading] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const showToast = useStore((s) => s.showToast);

  useEffect(() => {
    document.title = 'Pricing | WedBox';
    return () => { document.title = 'WedBox'; };
  }, []);

  const handleJoin = async (planId: '3month' | '12month') => {
    setLoading(planId);
    try {
      const { checkout_url } = await vendorOnboardingApi.createCheckout(planId);
      window.location.href = checkout_url;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Could not start checkout. Please try again.';
      showToast(message, 'error');
      setLoading(null);
    }
  };

  return (
    <PublicLayout>
      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#e6f7f6] via-white to-[#f5f0ff] py-20 px-4">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#38b2ac]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-purple-200/30 blur-3xl" />

        <div className="relative mx-auto max-w-2xl text-center">
          <span className="inline-block mb-4 rounded-full bg-[#38b2ac]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#38b2ac]">
            For Wedding Vendors in Cyprus
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
            Grow Your Wedding<br />
            <span className="text-[#38b2ac]">Business with WedBox</span>
          </h1>
          <p className="text-gray-500 text-lg mb-2">
            Connect with couples planning their perfect day — no middlemen, no commission.
          </p>
          <p className="text-sm font-medium text-gray-400">
            Transparent pricing · No hidden fees · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── Pricing cards ───────────────────────────────────────── */}
      <section className="bg-[#f7fbfb] py-16 px-4">
        <div className="mx-auto max-w-4xl flex flex-col md:flex-row gap-20 items-stretch">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex-1 flex flex-col rounded-2xl overflow-hidden transition-transform hover:-translate-y-1 ${
                plan.highlight
                  ? 'shadow-2xl ring-2 ring-[#38b2ac]'
                  : 'shadow-md ring-1 ring-gray-200'
              }`}
            >
              {/* Card header */}
              <div
                className={`px-8 pt-8 pb-6 ${
                  plan.highlight
                    ? 'bg-gradient-to-br from-[#38b2ac] to-[#2d9da3] text-white'
                    : 'bg-white text-gray-900'
                }`}
              >
                {plan.badge && (
                  <span className="inline-block mb-3 rounded-full bg-white/20 border border-white/40 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
                    {plan.badge}
                  </span>
                )}
                <h2
                  className={`text-xl font-bold mb-1 ${
                    plan.highlight ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {plan.name}
                </h2>
                <p
                  className={`text-sm mb-5 ${
                    plan.highlight ? 'text-white/80' : 'text-gray-400'
                  }`}
                >
                  {plan.tagline}
                </p>

                {/* Price */}
                <div className="flex items-end gap-2">
                  <span
                    className={`text-5xl font-extrabold leading-none ${
                      plan.highlight ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {plan.price}
                  </span>
                  <div className="mb-1">
                    <p
                      className={`text-sm font-medium ${
                        plan.highlight ? 'text-white/80' : 'text-gray-500'
                      }`}
                    >
                      {plan.period}
                    </p>
                    <p
                      className={`text-xs ${
                        plan.highlight ? 'text-white/60' : 'text-gray-400'
                      }`}
                    >
                      {plan.perMonth}
                    </p>
                  </div>
                </div>

                {plan.savingBadge && (
                  <span className="inline-block mt-3 rounded-full bg-yellow-400/20 border border-yellow-300/50 px-3 py-0.5 text-xs font-semibold text-yellow-200">
                    {plan.savingBadge}
                  </span>
                )}
              </div>

              {/* Card body */}
              <div
                className={`flex-1 flex flex-col px-8 py-6 ${
                  plan.highlight ? 'bg-[#f0fdfb]' : 'bg-white'
                }`}
              >
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((f, i) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-gray-700">
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                          plan.highlight && i === 0
                            ? 'bg-[#38b2ac]/10'
                            : plan.highlight
                            ? 'bg-[#38b2ac]/10'
                            : 'bg-[#38b2ac]/10'
                        }`}
                      >
                        <svg
                          className="w-3 h-3 text-[#38b2ac]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </span>
                      <span className={plan.highlight && i === 0 ? 'font-medium' : ''}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleJoin(plan.id)}
                  disabled={loading !== null}
                  className={`w-full py-3.5 rounded-full font-bold text-sm transition-all ${
                    loading === plan.id
                      ? 'opacity-60 cursor-not-allowed'
                      : 'active:scale-95'
                  } ${
                    plan.highlight
                      ? 'bg-[#38b2ac] text-white hover:bg-[#2c9c96] shadow-lg shadow-[#38b2ac]/30'
                      : 'bg-gray-900 text-white hover:bg-gray-700'
                  }`}
                >
                  {loading === plan.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Redirecting…
                    </span>
                  ) : (
                    plan.cta
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* ── FAQ ─────────────────────────────────────────────────── */}
      <section className="bg-[#f7fbfb] py-16 px-4">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left text-sm font-semibold text-gray-800 hover:bg-gray-50 transition"
                >
                  {faq.q}
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ml-4 ${
                      openFaq === i ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-sm text-gray-500 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
