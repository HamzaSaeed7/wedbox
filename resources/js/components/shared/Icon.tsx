import React from 'react';

interface IconProps {
  name: string;
  size?: number;
  stroke?: number;
  color?: string;
  fill?: string;
}

const PATHS: Record<string, React.ReactNode> = {
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
  location: <><path d="M12 21s-7-7.5-7-12a7 7 0 1 1 14 0c0 4.5-7 12-7 12Z"/><circle cx="12" cy="9" r="2.6"/></>,
  heart: <path d="M12 20.5s-7.5-4.5-9.4-9.6C1.2 7.4 4 4 7.2 4c1.9 0 3.4 1 4.8 2.6C13.4 5 14.9 4 16.8 4 20 4 22.8 7.4 21.4 10.9 19.5 16 12 20.5 12 20.5Z"/>,
  'heart-filled': <path d="M12 20.5s-7.5-4.5-9.4-9.6C1.2 7.4 4 4 7.2 4c1.9 0 3.4 1 4.8 2.6C13.4 5 14.9 4 16.8 4 20 4 22.8 7.4 21.4 10.9 19.5 16 12 20.5 12 20.5Z" fill="currentColor"/>,
  cart: <><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M3 4h2l2.5 12.5a2 2 0 0 0 2 1.5h8a2 2 0 0 0 2-1.4L21 9H6"/></>,
  user: <><circle cx="12" cy="8" r="3.6"/><path d="M4.5 20a8 8 0 0 1 15 0"/></>,
  menu: <><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></>,
  close: <><path d="M6 6l12 12"/><path d="M18 6 6 18"/></>,
  chev: <path d="m9 6 6 6-6 6"/>,
  chevDown: <path d="m6 9 6 6 6-6"/>,
  arrowRight: <><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></>,
  star: <path d="M12 3.5 14.5 9l6 .5-4.6 4 1.4 6L12 16.7 6.7 19.5l1.4-6L3.5 9.5l6-.5L12 3.5Z" fill="currentColor" stroke="none"/>,
  starOutline: <path d="M12 3.5 14.5 9l6 .5-4.6 4 1.4 6L12 16.7 6.7 19.5l1.4-6L3.5 9.5l6-.5L12 3.5Z"/>,
  check: <path d="m5 12 5 5 9-11"/>,
  plus: <><path d="M12 5v14"/><path d="M5 12h14"/></>,
  minus: <path d="M5 12h14"/>,
  home: <><path d="M3 11 12 4l9 7"/><path d="M5 10v9.5a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5V10"/></>,
  inbox: <><path d="M22 13H17l-2 3h-6l-2-3H2"/><rect x="3" y="5" width="18" height="13" rx="2"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.8.3l-.1.1A2 2 0 1 1 4.3 16.9l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8L4.2 7A2 2 0 1 1 7 4.2l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1A2 2 0 1 1 19.7 7l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></>,
  bookings: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4"/><path d="M8 3v4"/><path d="M3 11h18"/></>,
  services: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  billing: <><rect x="2.5" y="6" width="19" height="13" rx="2"/><path d="M2.5 10h19"/></>,
  blog: <><path d="M4 4h12l4 4v12H4z"/><path d="M14 4v6h6"/><path d="M8 13h8"/><path d="M8 17h6"/></>,
  pencil: <><path d="m12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></>,
  trash: <><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></>,
  eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
  msg: <path d="M21 12a8 8 0 0 1-11.6 7.2L4 21l1.8-5.4A8 8 0 1 1 21 12Z"/>,
  send: <><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></>,
  facebook: <path d="M9 8H6v4h3v9h4v-9h3l1-4h-4V6.5c0-.6.4-1 1-1h3V2h-3a4 4 0 0 0-4 4Z"/>,
  instagram: <><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle cx="17.5" cy="6.5" r=".7" fill="currentColor"/></>,
  twitter: <path d="M22 5.8a8.2 8.2 0 0 1-2.4.7 4 4 0 0 0 1.8-2.3 8.3 8.3 0 0 1-2.6 1A4.1 4.1 0 0 0 12 9c0 .3 0 .6.1.9A11.7 11.7 0 0 1 3 4.5a4 4 0 0 0 1.3 5.4 4 4 0 0 1-1.9-.5v.1a4.1 4.1 0 0 0 3.3 4 4 4 0 0 1-1.8 0 4.1 4.1 0 0 0 3.9 2.8A8.4 8.4 0 0 1 2 18a11.8 11.8 0 0 0 6.4 1.9c7.7 0 11.9-6.4 11.9-12v-.5A8.5 8.5 0 0 0 22 5.8Z"/>,
  linkedin: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 10v8M7 7v.01M11 18v-5a2 2 0 0 1 4 0v5M11 13v-3"/></>,
  whatsapp: <><path d="M20.5 12a8.5 8.5 0 1 1-14.5-6L5 21l5.2-1A8.5 8.5 0 0 0 20.5 12Z"/><path d="M9 9c.3 1 1 2.5 2 3.5S13.5 14.5 14.5 15c.3.2.7.3 1 0l1.2-1c.2-.2.5-.2.7-.1l1.4.8M8 8c.2-.4.6-.5.9-.5h.6c.2 0 .5 0 .6.4.2.5.5 1.3.6 1.5.1.2 0 .4 0 .6l-.5.6-.4.4"/></>,
  download: <><path d="M12 3v12"/><path d="m6 11 6 6 6-6"/><path d="M5 21h14"/></>,
  copy: <><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></>,
  upload: <><path d="M12 17V5"/><path d="m6 11 6-6 6 6"/><path d="M5 21h14"/></>,
  music: <><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></>,
  camera: <><rect x="2.5" y="6.5" width="19" height="13" rx="2"/><circle cx="12" cy="13" r="3.5"/><path d="M8 6.5V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1.5"/></>,
  yacht: <><path d="M2 18s2 2 5 2 5-2 5-2 2 2 5 2 5-2 5-2"/><path d="M3 14h18l-3-5h-9z"/><path d="M12 9V3"/><path d="M12 3l5 6"/></>,
  car: <><path d="M5 16V12l2-5h10l2 5v4"/><path d="M3 16h18"/><circle cx="7" cy="17.5" r="1.5"/><circle cx="17" cy="17.5" r="1.5"/></>,
  venue: <><path d="M3 21V11l9-7 9 7v10"/><path d="M9 21v-6h6v6"/></>,
  catering: <><path d="M3 11h18l-2 9H5z"/><path d="M12 6v5"/><path d="M8 6V3h8v3"/></>,
  florist: <><circle cx="12" cy="9" r="3"/><circle cx="7" cy="13" r="3"/><circle cx="17" cy="13" r="3"/><path d="M12 12v9"/></>,
  suit: <><path d="M6 22V8l3-4 3 2 3-2 3 4v14"/><path d="m9 4 3 6 3-6"/></>,
  dress: <><path d="m9 3 3 3 3-3"/><path d="M9 3v3l-3 4 1 12h10l1-12-3-4V3"/></>,
  glass: <><path d="M6 3h12l-1 9a5 5 0 0 1-10 0Z"/><path d="M12 13v7"/><path d="M8 21h8"/></>,
  cocktail: <><path d="M4 4h16l-8 9z"/><path d="M12 13v7"/><path d="M8 21h8"/></>,
  hotel: <><path d="M3 21V8l9-5 9 5v13"/><path d="M9 21v-7h6v7"/><path d="M6 11h.01M6 14h.01M18 11h.01M18 14h.01"/></>,
  makeup: <><path d="M6 4h12v6H6z"/><path d="M9 10v10h6V10"/><path d="M11 14h2"/></>,
  card: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/></>,
  hiker: <><circle cx="13" cy="4" r="1.5"/><path d="M8 21l3-7 3 2 4-1"/><path d="m11 9 3 2 4-2"/></>,
  spa: <><path d="M12 3c0 4 3 6 6 8-3 1-6 4-6 8"/><path d="M12 19c0-4-3-7-6-8 3-2 6-4 6-8"/></>,
  bell: <><path d="M6 8a6 6 0 0 1 12 0c0 5 3 6 3 8H3c0-2 3-3 3-8"/><path d="M10 21a2 2 0 0 0 4 0"/></>,
  play: <path d="M6 4v16l14-8Z" fill="currentColor" stroke="none"/>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  list: <><path d="M9 6h11"/><path d="M9 12h11"/><path d="M9 18h11"/><circle cx="4.5" cy="6" r=".8" fill="currentColor"/><circle cx="4.5" cy="12" r=".8" fill="currentColor"/><circle cx="4.5" cy="18" r=".8" fill="currentColor"/></>,
  filter: <><path d="M3 5h18"/><path d="M6 12h12"/><path d="M10 19h4"/></>,
  map: <><path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v16"/><path d="M15 6v16"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  package: <><path d="m3 8 9-5 9 5-9 5z"/><path d="M3 8v8l9 5 9-5V8"/></>,
  diamond: <><path d="m6 4 6-2 6 2 4 5-10 13L2 9Z"/><path d="M2 9h20"/><path d="m12 22 3-13"/><path d="m12 22-3-13"/></>,
};

export default function Icon({ name, size = 18, stroke = 1.6, color = 'currentColor', fill = 'none' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[name] || PATHS.diamond}
    </svg>
  );
}
