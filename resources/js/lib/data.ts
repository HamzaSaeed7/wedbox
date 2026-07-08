// WedBox — Static config data (categories, cities) + image utility
import type { Category, City } from './types';

// ─── Image helper — picsum.photos seeds consistent images from an ID string
export const IMG = (id: string, w = 800, h = 600) =>
  `https://picsum.photos/seed/${id}/${w}/${h}`;

// ─── Categories (UI config: slugs, names, icons, colors)
export const CATEGORIES: Category[] = [
  { slug: 'venue',         name: 'Venues',          icon: 'venue',         color: '#4DC9C9' },
  { slug: 'catering',      name: 'Catering',        icon: 'catering',      color: '#E08A5B' },
  { slug: 'florist',       name: 'Florists',        icon: 'florist',       color: '#D85A8E' },
  { slug: 'car-hire',      name: 'Car Hire',        icon: 'car',           color: '#5B7DE0' },
  { slug: 'photography',   name: 'Photography',     icon: 'camera',        color: '#8A5BE0' },
  { slug: 'music',         name: 'Music',           icon: 'music',         color: '#E0B85B' },
  { slug: 'bride-dress',   name: 'Bride Dress',     icon: 'dress',         color: '#E085B8' },
  { slug: 'groom-suite',   name: 'Groom Suite',     icon: 'suit',          color: '#3A4A4A' },
  { slug: 'bridesmaid',    name: 'Bridesmaids',     icon: 'dress',         color: '#D89BBA' },
  { slug: 'best-man',      name: 'Best Man',        icon: 'suit',          color: '#516B6B' },
  { slug: 'flower-girl',   name: 'Flower Girl',     icon: 'dress',         color: '#F1B0C9' },
  { slug: 'yacht',         name: 'Yacht Hire',      icon: 'yacht',         color: '#3996C9' },
  { slug: 'bachelor',      name: 'Bachelor Party',  icon: 'glass',         color: '#2F6F6F' },
  { slug: 'bachelorette',  name: 'Bachelorette',    icon: 'glass',         color: '#E04F86' },
  { slug: 'hotel',         name: 'Hotels',          icon: 'hotel',         color: '#8FB3B3' },
  { slug: 'bar',           name: 'Bar',             icon: 'cocktail',      color: '#B86A3C' },
  { slug: 'makeup',        name: 'Make-up',         icon: 'makeup',        color: '#C95B7D' },
  { slug: 'hair',          name: 'Hair',            icon: 'hair',          color: '#A0522D' },
  { slug: 'invitation',    name: 'Invitations',     icon: 'mail',          color: '#C98A5B' },
  { slug: 'cake-desserts', name: 'Cake & Desserts', icon: 'cake',          color: '#E07BA0' },
];

// ─── Cities (Cyprus) — used for location dropdowns
export const CITIES: City[] = [
  { id: 1, name: 'Ayia Napa',  country: 'Cyprus', bar_price: 8 },
  { id: 2, name: 'Paphos',     country: 'Cyprus', bar_price: 9 },
  { id: 3, name: 'Limassol',   country: 'Cyprus', bar_price: 10 },
  { id: 4, name: 'Nicosia',    country: 'Cyprus', bar_price: 9 },
  { id: 5, name: 'Larnaca',    country: 'Cyprus', bar_price: 8 },
  { id: 6, name: 'Protaras',   country: 'Cyprus', bar_price: 8 },
  { id: 7, name: 'Paralimni',  country: 'Cyprus', bar_price: 7 },
  { id: 8, name: 'Troodos Mountain', country: 'Cyprus', bar_price: 7 },
];
