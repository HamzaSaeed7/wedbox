import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import CartDrawer from '../components/layout/CartDrawer';
import ToastStack from '../components/shared/Toast';
import { useStore } from '../store';

interface Props {
  children: React.ReactNode;
}

// Page title map
const TITLE_MAP: Record<string, string> = {
  '/':         'Home | Wedbi',
  '/search':   'Search | Wedbi',
  '/about':    'About Us | Wedbi',
  '/contact':  'Contact | Wedbi',
  '/faq':      'FAQ | Wedbi',
  '/cart':     'My Cart | Wedbi',
  '/auth':     'Sign In | Wedbi',
  '/login':    'Sign In | Wedbi',
  '/blog':     'Blog | Wedbi',
};

export default function PublicLayout({ children }: Props) {
  const { url } = usePage();
  const pathname = url.split('?')[0];
  const { setUser } = useStore();

  // Sync Inertia auth.user into Zustand store
  const { auth } = usePage().props as unknown as { auth: { user: unknown } };
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setUser((auth?.user as any) ?? null);
  }, [auth?.user]);

  // Page title
  useEffect(() => {
    document.title = TITLE_MAP[pathname] ?? 'Wedbi';
  }, [pathname]);

  // Scroll to top on navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <Header />
      <CartDrawer />
      <ToastStack />
      <main style={{ paddingTop: 72 }}>
        {children}
      </main>
      <Footer />
    </>
  );
}
