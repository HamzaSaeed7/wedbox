import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useMutation } from '@tanstack/react-query';
import Icon from './Icon';
import { useStore } from '../../store';
import { feedbackApi } from '../../lib/api';
import happyImg from '../../assets/happy.png';
import sadImg from '../../assets/sad.png';
import angryImg from '../../assets/angry.png';

type Experience = 'happy' | 'sad' | 'angry';

const OPTIONS: { value: Experience; label: string; img: string }[] = [
  { value: 'sad',   label: 'Sad',   img: sadImg },
  { value: 'happy', label: 'Happy', img: happyImg },
  { value: 'angry', label: 'Angry', img: angryImg },
];

export default function FeedbackWidget() {
  const showToast = useStore((s) => s.showToast);
  const [open, setOpen] = useState(false);
  const [experience, setExperience] = useState<Experience | null>(null);
  const [text, setText] = useState('');

  const reset = () => { setExperience(null); setText(''); };

  const submitMutation = useMutation({
    mutationFn: () => feedbackApi.submit({ feedback_text: text.trim(), experience: experience! }),
    onSuccess: () => {
      showToast('Thanks for your feedback!', 'success');
      setOpen(false);
      reset();
    },
    onError: () => showToast('Could not send feedback. Please try again.', 'error'),
  });

  const canSend = !!experience && text.trim().length > 0 && !submitMutation.isPending;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, color: 'white', fontWeight: 500, fontSize: 14, background: 'rgba(255,255,255,.1)', border: 0, cursor: 'pointer', width: '100%', whiteSpace: 'nowrap' }}>
        <Icon name="msg" size={18} color="white" /> Feedback
      </button>

      {open && createPortal(
        <div
          onClick={() => !submitMutation.isPending && setOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="card"
            style={{ width: 440, maxWidth: '100%', padding: 28, color: 'var(--ink)', position: 'relative' }}>
            <button
              onClick={() => setOpen(false)} aria-label="Close"
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 0, cursor: 'pointer', color: 'var(--muted)' }}>
              <Icon name="close" size={20} />
            </button>

            <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Feedback</h2>

            <div style={{ fontSize: 14, fontWeight: 700, marginTop: 22 }}>How was your Experience?</div>
            <div style={{ display: 'flex', gap: 28, marginTop: 16 }}>
              {OPTIONS.map((o) => {
                const selected = experience === o.value;
                return (
                  <button
                    key={o.value} type="button" onClick={() => setExperience(o.value)}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, background: 'none', border: 0, cursor: 'pointer', padding: 4, borderRadius: 12, opacity: experience && !selected ? 0.5 : 1, transition: 'opacity .15s, transform .15s', transform: selected ? 'scale(1.08)' : 'none' }}>
                    <img src={o.img} alt={o.label} width={56} height={56} style={{ objectFit: 'contain' }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-700)' }}>{o.label}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ fontSize: 14, fontWeight: 700, marginTop: 26 }}>Write Comments?</div>
            <textarea
              className="textarea mt-8" rows={4} placeholder="Write a feedback"
              value={text} onChange={(e) => setText(e.target.value)}
              style={{ width: '100%', resize: 'vertical' }} />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
              <button
                className="btn btn-primary" disabled={!canSend}
                onClick={() => submitMutation.mutate()}>
                {submitMutation.isPending ? 'Sending…' : 'Send Feedback'}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
