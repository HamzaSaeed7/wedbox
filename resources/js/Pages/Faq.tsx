import { useState } from 'react';
import Icon from '../components/shared/Icon';
import PublicLayout from '../Layouts/PublicLayout';

export default function Faq() {
  const qa: [string, string][] = [
    ['How does WedBox work?', 'Browse vendors, add them to your cart, and reserve everything in one place. We aggregate the total so there are no surprise costs.'],
    ['Can I cancel a booking?', 'You can request cancellation from your dashboard. Refund terms vary by vendor and are shown before you checkout.'],
    ['Do you charge couples?', 'No. WedBox is free for couples — vendors pay a small commission on confirmed bookings.'],
    ['How do you vet vendors?', 'Every vendor is interviewed, document-checked and re-reviewed every season based on customer ratings.'],
    ['What about countries outside Cyprus?', 'We launched in Cyprus and are expanding across the Mediterranean. Sign up to hear when we open your destination.'],
  ];
  const [open, setOpen] = useState(0);

  return (
    <PublicLayout>
      <div className="container" style={{ padding: '60px 28px', maxWidth: 880 }}>
        <div className="muted text-13 fw-600">FREQUENTLY ASKED</div>
        <h1 className="mt-4" style={{ fontSize: 44 }}>Questions, answered.</h1>
        <div className="mt-32" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {qa.map(([q, a], i) => (
            <div key={i} className="card card-pad" onClick={() => setOpen(open === i ? -1 : i)} style={{ cursor: 'pointer' }}>
              <div className="flex items-center justify-between">
                <span className="fw-700 text-15">{q}</span>
                <Icon name={open === i ? 'minus' : 'plus'} size={14} />
              </div>
              {open === i && <p className="muted mt-12 text-14">{a}</p>}
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
