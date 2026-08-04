import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import Icon from '../components/shared/Icon';
import Logo from '../components/shared/Logo';
import { WEDBI_LOGO_WHITE as logoWhite } from '../lib/brand';
import { useStore } from '../store';
import { authApi } from '../lib/api';
import ToastStack from '../components/shared/Toast';

// ─── Helpers
function Trust({ value, label, light }: { value: string; label: string; light?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, color: light ? 'white' : 'var(--ink)' }}>{value}</div>
      <div style={{ fontSize: 12, color: light ? 'rgba(255,255,255,.8)' : 'var(--muted)' }}>{label}</div>
    </div>
  );
}

function AuthLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="field-label" style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>
      {children}{required && <span style={{ color: '#E11D48', marginLeft: 4 }}>*</span>}
    </label>
  );
}

function TogglePair({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="flex gap-8" style={{ background: 'var(--bg-3)', padding: 4, borderRadius: 999, width: 'fit-content' }}>
      {options.map((o) => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)} className="btn btn-sm"
          style={{ background: value === o.value ? 'white' : 'transparent', color: 'var(--ink)', boxShadow: value === o.value ? '0 2px 8px rgba(0,0,0,.08)' : 'none', borderColor: 'transparent', borderRadius: 999 }}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

interface AuthPageProps {
  verified?: string;
  already?: string;
}

export default function AuthPage() {
  const pageProps = usePage().props as AuthPageProps;
  const justVerified = pageProps.verified === '1';
  const alreadyVerified = pageProps.already === '1';

  // Also check URL params for redirect from email link
  const urlParams = new URLSearchParams(window.location.search);
  const verifiedParam = urlParams.get('verified');
  const alreadyParam = urlParams.get('already');
  const verifyFailed = verifiedParam === '0';
  const justVerifiedUrl = verifiedParam === '1';
  const alreadyVerifiedUrl = alreadyParam === '1';

  const showJustVerified = justVerified || justVerifiedUrl;
  const showAlreadyVerified = alreadyVerified || alreadyVerifiedUrl;

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [step, setStep] = useState<'form' | 'verify-email'>('form');
  const [role, setRole] = useState('customer');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
const { login, register, authLoading } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'login') {
        await login(email, password);
        // login() in store handles navigation
      } else {
        if (password !== confirm) { setError('Passwords do not match.'); return; }
        const data = await register({ first_name: firstName, last_name: lastName, email, password, password_confirmation: confirm, role });
        if (data?.needs_verification) {
          setRegisteredEmail(data.email ?? email);
          setStep('verify-email');
          return;
        }
        // If register auto-logs in
        router.visit('/dashboard/buyer');
      }
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const responseData = (err as any)?.response?.data;
      if (responseData?.needs_verification) {
        setRegisteredEmail(responseData.email ?? email);
        setStep('verify-email');
        return;
      }
      if (responseData?.errors) {
        setError(Object.values(responseData.errors as Record<string, string[]>).flat().join(' '));
      } else {
        setError(responseData?.message || 'Something went wrong. Please try again.');
      }
    }
  };

  const handleResend = async () => {
    setResendStatus('sending');
    try {
      await authApi.resendVerification(registeredEmail);
      setResendStatus('sent');
      setTimeout(() => setResendStatus('idle'), 4000);
    } catch {
      setResendStatus('idle');
    }
  };

  return (
    <div className="auth-shell">
      <ToastStack />

      {/* ── Left panel ── */}
      <div className="auth-side">
        <img src="/Auth.jpg" alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        {/* Richer gradient: deep teal at top, warm amber tint towards centre */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(155deg, rgba(8,52,46,.82) 0%, rgba(12,55,48,.68) 45%, rgba(40,30,10,.60) 100%)' }} />

        <div style={{ position: 'relative', padding: '40px 52px', color: 'white', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <img src={logoWhite} alt="Wedbi" style={{ height: 36, width: 'auto' }} />
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,.85)', fontSize: 13, fontWeight: 600, background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.22)', borderRadius: 999, padding: '8px 16px', textDecoration: 'none' }}>
              ← Back to site
            </Link>
          </div>

          {/* Centre content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 28, padding: '44px 0' }}>

            {/* Location badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 999, padding: '6px 14px', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', width: 'fit-content' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
              DESTINATION WEDDINGS · CYPRUS
            </div>

            {/* Headline */}
            <div>
              <h2 style={{ color: 'white', fontSize: 46, fontWeight: 800, lineHeight: 1.08, margin: 0 }}>Your perfect</h2>
              <h2 style={{ fontSize: 46, fontWeight: 800, lineHeight: 1.08, margin: 0, fontStyle: 'italic', color: 'var(--primary)' }}>Cyprus wedding</h2>
              <h2 style={{ color: 'white', fontSize: 46, fontWeight: 800, lineHeight: 1.08, margin: 0 }}>starts here.</h2>
            </div>

            <p style={{ color: 'rgba(255,255,255,.82)', fontSize: 15, lineHeight: 1.65, maxWidth: 400, margin: 0 }}>
              From venues and photographers to floristry and yacht hire — every vendor, every message, every payment in one seamless place.
            </p>

            {/* Why Wedbi — value props */}
            <div style={{ background: 'rgba(255,255,255,.10)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 18, padding: '20px 24px', maxWidth: 460 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', color: 'rgba(255,255,255,.6)', marginBottom: 16 }}>WHY COUPLES CHOOSE WEDBI</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                {[
                  { icon: '✦', label: 'All-in-one platform', desc: 'Every vendor and detail — one dashboard' },
                  { icon: '✦', label: 'Transparent pricing', desc: 'No hidden fees, total cost upfront' },
                  { icon: '✦', label: 'Cyprus expertise', desc: 'Local knowledge, world-class results' },
                  { icon: '✦', label: 'Tailored to you', desc: 'Your vision, your love story, your day' },
                ].map((pt) => (
                  <div key={pt.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <span style={{ color: 'var(--primary)', fontSize: 10, marginTop: 3, flexShrink: 0 }}>{pt.icon}</span>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{pt.label}</span>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', marginLeft: 6 }}>— {pt.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Bottom trust bar */}
          <div style={{ display: 'flex', gap: 32, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,.12)' }}>
            <Trust value="1,800+" label="Happy couples" light />
            <Trust value="320+" label="Verified vendors" light />
            <Trust value="4.9★" label="Average rating" light />
            <Trust value="2024" label="Founded in Cyprus" light />
          </div>
        </div>
      </div>

      {/* ── Right form ── */}
      <div className="auth-form">
        <div style={{ maxWidth: 420, width: '100%', marginInline: 'auto' }}>

          {step === 'verify-email' ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: 999, background: 'var(--primary-50)', display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
                <Icon name="msg" size={28} color="var(--primary-700)" />
              </div>
              <h2>Check your inbox</h2>
              <p className="muted mt-8" style={{ lineHeight: 1.6 }}>
                We've sent a verification link to<br />
                <strong style={{ color: 'var(--ink)' }}>{registeredEmail}</strong>
              </p>
              <p className="muted mt-12 text-13" style={{ lineHeight: 1.6 }}>
                Click the link in the email to activate your account. It may take a minute — check your spam folder too.
              </p>
              <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button className="btn btn-primary btn-block" onClick={handleResend} disabled={resendStatus !== 'idle'}>
                  {resendStatus === 'sending' ? 'Sending…' : resendStatus === 'sent' ? '✓ Email sent!' : 'Resend verification email'}
                </button>
                <button className="btn btn-ghost btn-block" onClick={() => { setStep('form'); setMode('login'); setError(''); }}>
                  Back to sign in
                </button>
              </div>
            </div>
          ) : (
            <>
              {showJustVerified && !showAlreadyVerified && (
                <div style={{ background: '#E6F7F0', border: '1px solid #6EE7B7', borderRadius: 10, padding: '12px 16px', color: '#065F46', fontSize: 14, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name="check" size={16} color="#059669" />
                  Email verified! You can now sign in.
                </div>
              )}
              {showAlreadyVerified && (
                <div style={{ background: '#E6F0FF', border: '1px solid #93C5FD', borderRadius: 10, padding: '12px 16px', color: '#1E40AF', fontSize: 14, marginBottom: 20 }}>
                  Your email is already verified. Sign in below.
                </div>
              )}
              {verifyFailed && (
                <div style={{ background: '#FFF0F0', border: '1px solid #FECDD3', borderRadius: 10, padding: '12px 16px', color: '#BE123C', fontSize: 14, marginBottom: 20 }}>
                  The verification link is invalid or expired. Please request a new one.
                </div>
              )}

              <Link href="/" style={{ display: 'flex', justifyContent: 'center', marginTop: -24, marginBottom: 24 }}>
                <Logo />
              </Link>
              <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
              <p className="muted mt-8">{mode === 'login' ? 'Sign in to continue planning.' : 'Plan your wedding without spreadsheets.'}</p>

              <form onSubmit={handleSubmit} className="mt-24" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {mode === 'signup' && (
                  <div>
                    <AuthLabel>I'm signing up as a</AuthLabel>
                    <div className="mt-8">
                      <TogglePair value={role} onChange={setRole} options={[{ value: 'customer', label: 'Customer' }, { value: 'vendor', label: 'Vendor' }]} />
                    </div>
                  </div>
                )}
                {mode === 'signup' && (
                  <div className="flex gap-8">
                    <div style={{ flex: 1 }}>
                      <AuthLabel required>First name</AuthLabel>
                      <input className="input mt-8" style={{ width: '100%' }} required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <AuthLabel required>Last name</AuthLabel>
                      <input className="input mt-8" style={{ width: '100%' }} required value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </div>
                  </div>
                )}
                <div>
                  <AuthLabel required>Email</AuthLabel>
                  <input type="email" className="input mt-8" style={{ width: '100%' }} required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <AuthLabel required>Password</AuthLabel>
                  <div style={{ position: 'relative' }}>
                    <input type={showPassword ? 'text' : 'password'} className="input mt-8" style={{ width: '100%', paddingRight: 40 }} required value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="button" onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-25%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                      <Icon name={showPassword ? 'eye-off' : 'eye'} size={18} />
                    </button>
                  </div>
                </div>
                {mode === 'signup' && (
                  <>
                    <div>
                      <AuthLabel required>Confirm password</AuthLabel>
                      <div style={{ position: 'relative' }}>
                        <input type={showConfirm ? 'text' : 'password'} className="input mt-8" style={{ width: '100%', paddingRight: 40 }} required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                        <button type="button" onClick={() => setShowConfirm(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-25%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }} aria-label={showConfirm ? 'Hide password' : 'Show password'}>
                          <Icon name={showConfirm ? 'eye-off' : 'eye'} size={18} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
                {error && (
                  <div style={{ background: '#FFF0F0', border: '1px solid #FECDD3', borderRadius: 10, padding: '10px 14px', color: '#BE123C', fontSize: 13 }}>
                    {error}
                  </div>
                )}
                <button type="submit" className="btn btn-primary btn-block btn-lg mt-4" disabled={authLoading}>
                  {authLoading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
                </button>
                <div className="text-14 muted" style={{ textAlign: 'center' }}>
                  {mode === 'login' ? (
                    <>New to Wedbi? <a href="#" onClick={(e) => { e.preventDefault(); setMode('signup'); setError(''); }} style={{ color: 'var(--primary-700)', fontWeight: 600 }}>Create an account</a></>
                  ) : (
                    <>Already have one? <a href="#" onClick={(e) => { e.preventDefault(); setMode('login'); setError(''); }} style={{ color: 'var(--primary-700)', fontWeight: 600 }}>Sign in</a></>
                  )}
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
