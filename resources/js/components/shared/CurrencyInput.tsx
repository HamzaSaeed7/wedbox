import React from 'react';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  containerStyle?: React.CSSProperties;
}

/**
 * A number input prefixed with a € symbol.
 * Drop-in replacement for <input type="number" className="input" />.
 * Pass width/flex via containerStyle; className still applies to the <input>.
 */
export default function CurrencyInput({ containerStyle, style, className = 'input', ...props }: CurrencyInputProps) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', ...containerStyle }}>
      <span style={{
        position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
        fontSize: 13, fontWeight: 500, color: 'var(--muted)', pointerEvents: 'none', lineHeight: 1,
      }}>€</span>
      <input
        type="number"
        className={className}
        style={{ paddingLeft: 26, width: '100%', ...style }}
        {...props}
      />
    </div>
  );
}
