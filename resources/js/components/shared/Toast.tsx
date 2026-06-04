import { useStore } from '../../store';

const icons = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

const colors = {
  success: { bg: '#22c55e', text: '#fff' },
  error:   { bg: '#ef4444', text: '#fff' },
  info:    { bg: '#3b82f6', text: '#fff' },
};

export default function ToastStack() {
  const toasts = useStore((s) => s.toasts);
  const dismissToast = useStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          onClick={() => dismissToast(t.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 18px',
            borderRadius: 10,
            background: colors[t.type].bg,
            color: colors[t.type].text,
            fontSize: 14,
            fontWeight: 500,
            boxShadow: '0 4px 16px rgba(0,0,0,.18)',
            cursor: 'pointer',
            pointerEvents: 'all',
            maxWidth: 340,
            animation: 'toast-in 0.25s ease',
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>{icons[t.type]}</span>
          <span>{t.message}</span>
        </div>
      ))}
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
