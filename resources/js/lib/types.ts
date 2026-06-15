// WedBox — TypeScript type definitions

export interface Category {
  slug: string;
  name: string;
  icon: string;
  color: string;
}

export interface City {
  id: number;
  name: string;
  country: string;
  bar_price: number;
}

// Service sub-types
export interface VenueConfig {
  min: number;
  max: number;
  pricePerPerson: number;
  minCost: number;
  location: string;
}

export interface CateringMenuItem {
  name: string;
  max: number;
  price: number;
  items: string[];
}

export interface CateringCuisine {
  name: string;
  menus: CateringMenuItem[];
}

export interface CateringConfig {
  cuisines: CateringCuisine[];
}

export interface FloristPackage {
  id: string;
  name: string;
  price: number;
  type: 'fresh' | 'fake';
  tier?: 'bronze' | 'silver' | 'gold' | null;
  features: string[];
  images: string[];
  images?: string[];
}

export interface FloristDesign {
  id: string;
  name: string;
  price: number;
  image: string;
}

export interface FloristAddon {
  id: string;
  name: string;
  price: number;
  price_per_unit?: number;
  unit?: string;
}

export interface FloristConfig {
  packages: FloristPackage[];
  colors: string[];
  designs: FloristDesign[];
  addons: FloristAddon[];
}

export interface CarHireHour {
  id: string;
  label: string;
  price: number;
}

export interface CarHireAddon {
  id: string;
  name: string;
  image: string;
}

export interface CarHireConfig {
  hours: CarHireHour[];
  addons: CarHireAddon[];
}

export interface PhotographyAddon {
  id: string;
  name: string;
  price: number;
}

export interface PhotographyPackage {
  id: string;
  name: string;
  price: number;
  includes: string[];
  addons: PhotographyAddon[];
}

export interface PhotographyConfig {
  packages: PhotographyPackage[];
}

export interface MusicConfig {
  pricePerHour: number;
  minimumHours: number;
  videoUrl: string;
}

export interface BrideDressExtra {
  id: string;
  name: string;
  price: number;
  image?: string;
}

export interface BrideDressConfig {
  priceRent: number;
  priceBuy: number;
  sizes: string[];
  extras: BrideDressExtra[];
}

export interface GroomSuiteConfig {
  priceRent: number;
  priceBuy: number;
  jacket: string[];
  vest: string[];
  shirt: string[];
  bottom: string[];
}

export interface BridesmaidConfig {
  price: number;
  sizes: string[];
}

export interface BestManConfig {
  priceRent: number;
  priceBuy: number;
  jacket: string[];
  vest: string[];
  shirt: string[];
  bottom: string[];
}

export interface FlowerGirlConfig {
  price: number;
  sizes: string[];
}

export interface YachtHireHour {
  id: string;
  label: string;
  price: number;
}

export interface YachtConfig {
  min: number;
  max: number;
  speed: string;
  length: string;
  cabinCrew: number;
  washroom: number;
  shower: number;
  chef: boolean;
  hours: YachtHireHour[];
}

export interface BachelorInclude {
  id: string;
  name: string;
  price: number;
  icon: string;
}

export interface BachelorConfig {
  pricePerHour: number;
  includes: BachelorInclude[];
}

export interface BacheloretteConfig {
  pricePerHour: number;
  includes: BachelorInclude[];
}

export interface HotelRoom {
  id: string;
  name: string;
  pricePerNight: number;
  maxAdults: number;
  maxKids: number;
  images: string[];
}

export interface HotelFacility {
  id: string;
  name: string;
  price: number;
}

export interface HotelConfig {
  rooms: HotelRoom[];
  facilities: HotelFacility[];
}

export interface BarMenu {
  id: string;
  name: string;
  price: number;
  items: string[];
}

export interface BarConfig {
  menus: BarMenu[];
}

export interface MakeupPackage {
  id: string;
  name: string;
  price: number;
  blurb: string;
  tier?: string | null;
  features: string[];
  images: string[];
}

export interface MakeupConfig {
  packages: MakeupPackage[];
}

export type HairConfig = MakeupConfig;

export interface Service {
  id: number;
  slug: string;
  vendor: string;
  title: string;
  location: string;
  images: string[];
  minimum_price: number;
  rating: number;
  reviews: number;
  featured?: boolean;
  description: string;
  // Category-specific configs
  venue?: VenueConfig;
  catering?: CateringConfig;
  florist?: FloristConfig;
  carHire?: CarHireConfig;
  photography?: PhotographyConfig;
  music?: MusicConfig;
  brideDress?: BrideDressConfig;
  groomSuite?: GroomSuiteConfig;
  bridesmaid?: BridesmaidConfig;
  bestMan?: BestManConfig;
  flowerGirl?: FlowerGirlConfig;
  yacht?: YachtConfig;
  bachelor?: BachelorConfig;
  bachelorette?: BacheloretteConfig;
  hotel?: HotelConfig;
  bar?: BarConfig;
  makeup?: MakeupConfig;
  hair?: HairConfig;
}

export interface Order {
  id: number;
  serviceId: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled' | 'in_cart';
  date: string;
  price: number;
  note?: string;
}

export interface MessageThread {
  id: number;
  vendor: string;
  avatar: string;
  last: string;
  time: string;
  unread: number;
}

export interface Message {
  from: 'me' | 'them';
  text: string;
  time: string;
}

export interface Testimonial {
  name: string;
  location: string;
  avatar: string;
  photo: string;
  text: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'vendor' | 'admin';
  joined: string;
  status: 'active' | 'banned';
}

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  cover: string;
  excerpt: string;
  author: string;
  readTime: number;
  date: string;
  published: boolean;
}

export interface CartItem {
  id: number;
  serviceId: number;
  price: number;
  detailSummary?: string;
  date?: string;
  payload?: Record<string, unknown>;
  serviceTitle?: string;
  serviceImage?: string;
}

export interface FormStateItem {
  label: string;
  detail?: string;
}

export interface FormState {
  total: number;
  summary: string;
  payload: Record<string, unknown>;
  items?: FormStateItem[];
}
