import { create } from 'zustand';
import { router } from '@inertiajs/react';
import api, { authApi } from '../lib/api';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'vendor' | 'admin';
  vendor_subscription_status?: string | null;
  vendor_plan?: string | null;
  profile?: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
    phone?: string;
    city?: string;
    country?: string;
    address1?: string;
    address2?: string;
    postal_code?: string;
  };
  vendorProfile?: {
    id?: number;
    business_name?: string;
    business_description?: string;
    category_id?: number;
    address1?: string;
    address2?: string;
    country?: string;
    city?: string;
    phone?: string;
    avatar_url?: string;
    onboarding_completed?: boolean;
  } | null;
}

interface CartItem {
  id: number;
  serviceId: number;
  price: number;
  detailSummary?: string;
  date?: string;
  payload?: Record<string, unknown>;
  serviceTitle?: string;
  serviceImage?: string;
}

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppStore {
  // Auth — user is set from Inertia shared props via useAuthUser() hook
  // This local copy is kept for components that need it outside React render
  user: AuthUser | null;
  authLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    first_name: string; last_name: string;
    email: string; password: string; password_confirmation: string; role?: string;
  }) => Promise<{ needs_verification?: boolean; email?: string }>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;

  cartCount: number;
  setCartCount: (n: number) => void;

  favorites: Set<number>;
  toggleFav: (id: number) => void;
  setFavorites: (ids: number[]) => void;

  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;

  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: number) => void;

  toasts: Toast[];
  showToast: (message: string, type?: Toast['type']) => void;
  dismissToast: (id: number) => void;
}

export const useStore = create<AppStore>((set) => ({
  user: null,
  authLoading: false,

  login: async (email, password) => {
    set({ authLoading: true });
    try {
      const data = await authApi.login({ email, password });
      set({ user: data.user, authLoading: false });
      // Use server-provided redirect (handles vendor pricing/onboarding gate)
      if (data.redirect) {
        router.visit(data.redirect);
      } else {
        const role = data.user?.role;
        if (role === 'vendor') router.visit('/dashboard/vendor');
        else if (role === 'admin') router.visit('/dashboard/admin');
        else router.visit('/dashboard/buyer');
      }
    } catch (e) {
      set({ authLoading: false });
      throw e;
    }
  },

  register: async (payload) => {
    set({ authLoading: true });
    try {
      const data = await authApi.register(payload);
      set({ authLoading: false });
      return data;
    } catch (e) {
      set({ authLoading: false });
      throw e;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (_) { /* ignore */ }
    set({ user: null, cart: [], favorites: new Set(), cartCount: 0 });
    router.visit('/');
  },

  setUser: (user) => set({ user }),

  cartCount: 0,
  setCartCount: (cartCount) => set({ cartCount }),

  favorites: new Set<number>(),
  toggleFav: (id) =>
    set((state) => {
      const next = new Set(state.favorites);
      next.has(id) ? next.delete(id) : next.add(id);
      return { favorites: next };
    }),
  setFavorites: (ids) => set({ favorites: new Set(ids) }),

  cartOpen: false,
  setCartOpen: (cartOpen) => set({ cartOpen }),

  cart: [],
  addToCart: (item) =>
    set((state) => ({
      cart: [...state.cart, { id: Date.now(), ...item }],
      cartCount: state.cartCount + 1,
    })),
  removeFromCart: (id) =>
    set((state) => ({
      cart: state.cart.filter((i) => i.id !== id),
      cartCount: Math.max(0, state.cartCount - 1),
    })),

  toasts: [],
  showToast: (message, type = 'success') => {
    const id = Date.now();
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3500);
  },
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

// Convenience hook: read auth user from Inertia shared props
// Usage: const user = useAuthUser()
import { usePage } from '@inertiajs/react';
export function useAuthUser(): AuthUser | null {
  const { auth } = usePage().props as unknown as { auth: { user: AuthUser | null } };
  return auth?.user ?? null;
}
