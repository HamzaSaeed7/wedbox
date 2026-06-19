import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import Icon from '../components/shared/Icon';
import { publicApi } from '../lib/api';
import PublicLayout from '../Layouts/PublicLayout';

export default function Contact() {
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [topic, setTopic]     = useState('General enquiry');
  const [message, setMessage] = useState('');
  const [sent, setSent]       = useState(false);
  const [err, setErr]         = useState('');

  const sendMutation = useMutation({
    mutationFn: () => publicApi.contact({ name, email, topic, message }),
    onSuccess: () => { setSent(true); setErr(''); },
    onError: () => setErr('Something went wrong. Please try again.'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) { setErr('Please fill in all required fields.'); return; }
    sendMutation.mutate();
  };

  return (
    <PublicLayout>
      <div className="container" style={{ padding: '60px 28px' }}>
        <div className="grid r-grid-halves" style={{ gap: 40 }}>
          <div>
            <div className="muted text-13 fw-600">CONTACT</div>
            <h1 className="mt-4" style={{ fontSize: 44 }}>Talk to a human.</h1>
            <p className="muted mt-16">Got a question about your booking or our marketplace? Drop us a line — we reply within a day.</p>
            <div className="mt-24" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: 'msg',      label: 'info@wedbox.io' },
                { icon: 'location', label: 'Limassol, Cyprus · London, UK' },
                { icon: 'clock',    label: 'Monday–Friday · 9am to 6pm (EET)' },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-12">
                  <span style={{ width: 40, height: 40, borderRadius: 999, background: 'var(--primary-50)', color: 'var(--primary-700)', display: 'grid', placeItems: 'center' }}>
                    <Icon name={icon} size={18} />
                  </span>
                  <span className="fw-600">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card card-pad">
            {sent ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Icon name="check" size={40} color="var(--primary)" />
                <div className="fw-700 mt-16" style={{ fontSize: 20 }}>Message sent!</div>
                <p className="muted mt-8">We'll get back to you within a day.</p>
                <button className="btn btn-soft mt-16" onClick={() => { setSent(false); setName(''); setEmail(''); setMessage(''); }}>Send another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div>
                  <label className="field-label">Your name *</label>
                  <input className="input mt-8" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="mt-12">
                  <label className="field-label">Email *</label>
                  <input type="email" className="input mt-8" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="mt-12">
                  <label className="field-label">Topic</label>
                  <select className="select mt-8" value={topic} onChange={(e) => setTopic(e.target.value)}>
                    <option>General enquiry</option>
                    <option>Booking issue</option>
                    <option>Vendor application</option>
                  </select>
                </div>
                <div className="mt-12">
                  <label className="field-label">Message *</label>
                  <textarea className="textarea mt-8" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} />
                </div>
                {err && <p className="mt-8" style={{ color: '#E11D48', fontSize: 13 }}>{err}</p>}
                <button type="submit" className="btn btn-primary btn-block mt-16" disabled={sendMutation.isPending}>
                  {sendMutation.isPending ? 'Sending…' : 'Send message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
