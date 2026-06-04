import logoSrc from '../../assets/logo.png';
import logo2Src from '../../assets/logo2.svg';
import logo3Src from '../../assets/logo3.svg';

interface LogoProps {
  /** White+teal horizontal lockup — used in transparent header over hero */
  white?: boolean;
  /** Icon-only white mark — used in teal/dark sidebars */
  light?: boolean;
  /** Smaller size — used in sidebar brand area */
  compact?: boolean;
}

export default function Logo({ white = false, light = false, compact = false }: LogoProps) {
  const height = compact ? 32 : 42;
  const src = white ? logo2Src : light ? logo3Src : logoSrc;
  return (
    <img
      src={src}
      alt="WedBox"
      style={{ height, width: 'auto', display: 'block' }}
    />
  );
}
