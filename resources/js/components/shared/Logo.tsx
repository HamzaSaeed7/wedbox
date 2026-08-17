import { WEDBI_LOGO, WEDBI_LOGO_WHITE } from '../../lib/brand';

interface LogoProps {
  /** White+teal horizontal lockup — used in transparent header over hero */
  white?: boolean;
  /** Icon-only white mark — used in teal/dark sidebars */
  light?: boolean;
  /** Smaller size — used in sidebar brand area */
  compact?: boolean;
  /** Explicit height override (px) — takes precedence over compact */
  size?: number;
}

export default function Logo({ white = false, light = false, compact = false, size }: LogoProps) {
  const height = size ?? (compact ? 36 : 48);
  const src = white || light ? WEDBI_LOGO_WHITE : WEDBI_LOGO;
  return (
    <img
      src={src}
      alt="Wedbi"
      style={{ height, width: 'auto', display: 'block' }}
    />
  );
}
