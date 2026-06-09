import axios from 'axios';

// Session-based — no Bearer token; cookies handle auth (set up in app.jsx)
const api = axios.create({
  baseURL: '/api',
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
  withCredentials: true,
});

// 401 handler: redirect to auth page only when session has expired mid-session.
// Skip redirect on dashboard initial load — Sanctum may just need a moment.
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      const isAuthRoute = window.location.pathname.startsWith('/auth')
        || window.location.pathname.startsWith('/login');
      // Only hard-redirect if we're NOT on a dashboard initial load
      // (i.e. the request was not the first call right after navigation)
      if (!isAuthRoute && document.readyState === 'complete') {
        // Give a small grace period so we don't redirect on the initial
        // page load before the session cookie is sent
        setTimeout(() => {
          const stillOnProtected = !window.location.pathname.startsWith('/auth')
            && !window.location.pathname.startsWith('/login');
          if (stillOnProtected) window.location.href = '/auth';
        }, 1500);
      }
    }
    return Promise.reject(err);
  },
);

export default api;

// Separate instance for web (non-API) routes — these carry the web middleware
// and have session support. Auth login/register/logout must go here.
const webApi = axios.create({
  baseURL: '/',
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
  withCredentials: true,
});

// ─── Auth (web routes — session-based, NOT /api)
export const authApi = {
  register: (d: { first_name: string; last_name: string; email: string; password: string; password_confirmation: string; role?: string }) =>
    webApi.post('/auth/register', d).then((r) => r.data),
  login: (d: { email: string; password: string }) =>
    webApi.post('/auth/login', d).then((r) => r.data),
  logout: () => webApi.post('/auth/logout'),
  me: () => api.get('/auth/user').then((r) => r.data),
  resendVerification: (email: string) =>
    api.post('/auth/email/resend', { email }).then((r) => r.data),
  /** DEV ONLY — remove before production */
  devVerify: (email: string) =>
    api.post('/auth/dev-verify', { email }).then((r) => r.data),
};

// ─── Services
export const servicesApi = {
  list: (params?: Record<string, string | number | undefined>) =>
    api.get('/services', { params }).then((r) => r.data),
  featured: () => api.get('/services/featured').then((r) => r.data),
  show: (id: number | string) => api.get(`/services/${id}`).then((r) => r.data),
};

// ─── Categories / Cities / Public
export const publicApi = {
  categories: () => api.get('/categories').then((r) => r.data),
  cities: () => api.get('/cities').then((r) => r.data),
  testimonials: () => api.get('/testimonials').then((r) => r.data),
  contact: (d: object) => api.post('/contact', d).then((r) => r.data),
  blog: () => api.get('/blog').then((r) => r.data),
  blogPost: (slug: string) => api.get(`/blog/${slug}`).then((r) => r.data),
};

// ─── Cart
export const cartApi = {
  get: () => api.get('/cart').then((r) => r.data),
  add: (d: { service_id: number; order_type: string; price?: number; deliver_date?: string; note?: string; order_details?: Record<string, unknown> }) =>
    api.post('/cart', d).then((r) => r.data),
  confirm: () => api.post('/cart/confirm').then((r) => r.data),
  remove: (id: number) => api.delete(`/cart/${id}`),
};

// ─── Customer Profile
export const profileApi = {
  get: () => api.get('/profile').then((r) => r.data),
  update: (d: object) => api.put('/profile', d).then((r) => r.data),
  updatePassword: (d: { current_password: string; password: string; password_confirmation: string }) =>
    api.put('/profile/password', d).then((r) => r.data),
};

// ─── Orders
export const ordersApi = {
  list: (params?: object) => api.get('/orders', { params }).then((r) => r.data),
  summary: () => api.get('/orders/summary').then((r) => r.data),
};

// ─── Favorites
export const favoritesApi = {
  list: () => api.get('/favorites').then((r) => r.data),
  add: (serviceId: number) => api.post(`/favorites/${serviceId}`),
  remove: (serviceId: number) => api.delete(`/favorites/${serviceId}`),
};

// ─── Conversations
export const conversationsApi = {
  list: () => api.get('/conversations').then((r) => r.data),
  create: (d: { vendor_id: number; service_id?: number }) => api.post('/conversations', d).then((r) => r.data),
  messages: (id: number) => api.get(`/conversations/${id}/messages`).then((r) => r.data),
  send: (id: number, body: string) => api.post(`/conversations/${id}/messages`, { body }).then((r) => r.data),
};

// ─── Reviews
export const reviewsApi = {
  post: (d: { service_id: number; rating: number; comment?: string }) =>
    api.post('/reviews', d).then((r) => r.data),
};

// ─── Vendor Onboarding / Checkout
export const vendorOnboardingApi = {
  createCheckout: (plan: '3month' | '12month') =>
    api.post('/vendor/checkout', { plan }).then((r) => r.data),
  billingInfo: () => api.get('/vendor/billing-info').then((r) => r.data),
  billingPortal: () => api.post('/vendor/billing-portal').then((r) => r.data),
  cancelSubscription: () => api.post('/vendor/cancel-subscription').then((r) => r.data),
  complete: (d: {
    business_name: string;
    business_description?: string;
    category_id: number;
    address1?: string;
    address2?: string;
    country?: string;
    city?: string;
    phone?: string;
    avatar_url?: string;
  }) => api.post('/vendor/onboarding', d).then((r) => r.data),
  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/upload/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },
};

// ─── File uploads (general)
export const uploadApi = {
  serviceImage: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/upload/service-image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r: { data: { url: string } }) => r.data.url);
  },
  avatar: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/upload/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r: { data: { url: string } }) => r.data.url);
  },
};

// ─── Vendor
export const vendorApi = {
  billingInfo: () => api.get('/vendor/billing-info').then((r) => r.data),
  billingPortal: () => api.post('/vendor/billing-portal').then((r) => r.data),
  cancelSubscription: () => api.post('/vendor/cancel-subscription').then((r) => r.data),
  services: () => api.get('/vendor/services').then((r) => r.data),
  showService: (id: number) => api.get(`/vendor/services/${id}`).then((r) => r.data),
  createService: (d: object) => api.post('/vendor/services', d).then((r) => r.data),
  updateService: (id: number, d: object) => api.put(`/vendor/services/${id}`, d).then((r) => r.data),
  updateSubdata: (id: number, data: object) => api.put(`/vendor/services/${id}/subdata`, { data }).then((r) => r.data),
  deleteService: (id: number) => api.delete(`/vendor/services/${id}`),
  orders: (params?: object) => api.get('/vendor/orders', { params }).then((r) => r.data),
  order: (id: number) => api.get(`/vendor/orders/${id}`).then((r) => r.data),
  approveOrder: (id: number) => api.put(`/vendor/orders/${id}/approve`).then((r) => r.data),
  rejectOrder: (id: number) => api.put(`/vendor/orders/${id}/reject`).then((r) => r.data),
  profile: () => api.get('/vendor/profile').then((r) => r.data),
  updateProfile: (d: object) => api.put('/vendor/profile', d).then((r) => r.data),
  updatePassword: (d: { current_password: string; password: string; password_confirmation: string }) =>
    api.put('/vendor/password', d).then((r) => r.data),
  deleteAccount: () => api.delete('/vendor/account').then((r) => r.data),
};

// ─── Admin
export const adminApi = {
  users: (params?: object) => api.get('/admin/users', { params }).then((r) => r.data),
  invite: (d: { name: string; email: string; role: string }) => api.post('/admin/users/invite', d).then((r) => r.data),
  ban: (id: number) => api.post(`/admin/users/${id}/ban`),
  unban: (id: number) => api.post(`/admin/users/${id}/unban`),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),
  services: (params?: Record<string, string | number | undefined>) => api.get('/admin/services', { params }).then((r) => r.data),
  deleteService: (id: number) => api.delete(`/admin/services/${id}`),
  toggleFeatured: (id: number) => api.patch(`/admin/services/${id}/feature`).then((r) => r.data),
  blog: () => api.get('/admin/blog').then((r) => r.data),
  createPost: (d: object) => api.post('/admin/blog', d).then((r) => r.data),
  updatePost: (id: number, d: object) => api.put(`/admin/blog/${id}`, d).then((r) => r.data),
  deletePost: (id: number) => api.delete(`/admin/blog/${id}`),
  vendors: (params?: object) => api.get('/admin/vendors', { params }).then((r) => r.data),
  orders: (params?: object) => api.get('/admin/orders', { params }).then((r) => r.data),
  adminFeedback: (params?: object) => api.get('/admin/feedback', { params }).then((r) => r.data),
};

// ─── Feedback
export const feedbackApi = {
  submit: (d: { feedback_text: string; experience: 'happy' | 'sad' | 'neutral' }) =>
    api.post('/feedback', d).then((r) => r.data),
};
