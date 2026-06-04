import { Link, router } from '@inertiajs/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Icon from '../components/shared/Icon';
import { useStore, useAuthUser } from '../store';
import { cartApi } from '../lib/api';
import { formatDate } from '../lib/utils';
import PublicLayout from '../Layouts/PublicLayout';

export default function Cart() {
  const { cart, removeFromCart, showToast } = useStore();
  const user = useAuthUser();
  const qc = useQueryClient();

  const { data: apiCartData, isLoading: apiLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.get(),
    enabled: !!user,
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => cartApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });

  const confirmMutation = useMutation({
    mutationFn: () => cartApi.confirm(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cart'] });
      showToast('Reservation confirmed! Vendors will respond shortly.', 'success');
      router.visit('/dashboard/buyer/orders');
    },
    onError: () => showToast('Could not confirm reservation. Please try again.', 'error'),
  });

  const useApiCart = !!user;
  const apiItems: {
    id: number;
    price: number;
    note?: string;
    deliver_date?: string;
    service: { id: number; title: string; images: string[] | { url: string }[]; category: { name: string; slug: string } };
  }[] = Array.isArray(apiCartData) ? apiCartData : [];

  const localItems = cart;

  const total = useApiCart
    ? apiItems.reduce((s, i) => s + Number(i.price || 0), 0)
    : localItems.reduce((s, i) => s + (i.price || 0), 0);

  const isEmpty = useApiCart ? apiItems.length === 0 : localItems.length === 0;

  const firstImg = (imgs: string[] | { url: string }[]): string => {
    if (!imgs?.length) return '';
    const first = imgs[0];
    return typeof first === 'string' ? first : first.url;
  };

  return (
    <PublicLayout>
      <div className="container-wide" style={{ padding: '40px 28px 60px' }}>
        <h1 style={{ fontSize: 32 }}>Your cart</h1>
        <p className="muted mt-4">Vendors locked into your reservation.</p>
        <div className="grid r-grid-cart mt-24" style={{ gap: 28 }}>
          <div>
            {apiLoading && useApiCart && (
              <div className="card card-pad" style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>Loading cart…</div>
            )}
            {!apiLoading && isEmpty && (
              <div className="card card-pad" style={{ textAlign: 'center', padding: 60 }}>
                <Icon name="cart" size={36} color="var(--line)" />
                <div className="fw-700 mt-12">Your cart is empty</div>
                <p className="muted text-14 mt-8">Browse the marketplace to start building your wedding.</p>
                <Link href="/search" className="btn btn-primary mt-16">Browse vendors</Link>
              </div>
            )}

            {useApiCart && !apiLoading && apiItems.map((item) => (
              <div key={item.id} className="card card-pad mb-12"
                onClick={() => router.visit(`/service/${item.service?.id}`)}
                style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: 18, cursor: 'pointer' }}>
                <img src={firstImg(item.service?.images ?? [])} alt="" style={{ width: 120, height: 100, objectFit: 'cover', borderRadius: 12 }} />
                <div>
                  <span className="chip chip-soft">{item.service?.category?.name}</span>
                  <div className="fw-700 mt-8">{item.service?.title}</div>
                  {item.note && <div className="muted text-13 mt-4">{item.note}</div>}
                  {item.deliver_date && <div className="muted text-13 mt-4">📅 {formatDate(item.deliver_date)}</div>}
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <span className="fw-700">€{Number(item.price || 0).toLocaleString()}</span>
                  <button onClick={(e) => { e.stopPropagation(); removeMutation.mutate(item.id); }} disabled={removeMutation.isPending} className="text-13 muted" style={{ background: 'transparent', border: 0 }}>Remove</button>
                </div>
              </div>
            ))}

            {!useApiCart && localItems.map((item) => (
              <div key={item.id} className="card card-pad mb-12"
                onClick={() => router.visit(`/service/${item.serviceId}`)}
                style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: 18, cursor: 'pointer' }}>
                {item.serviceImage
                  ? <img src={item.serviceImage} alt="" style={{ width: 120, height: 100, objectFit: 'cover', borderRadius: 12 }} />
                  : <div style={{ width: 120, height: 100, borderRadius: 12, background: 'var(--bg-3)', flexShrink: 0 }} />
                }
                <div>
                  <div className="fw-700 mt-8">{item.serviceTitle ?? 'Service'}</div>
                  <div className="muted text-13 mt-4">{item.detailSummary}</div>
                  {item.date && <div className="muted text-13 mt-4">📅 {formatDate(item.date)}</div>}
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <span className="fw-700">€{(item.price || 0).toLocaleString()}</span>
                  <button onClick={(e) => { e.stopPropagation(); removeFromCart(item.id); }} className="text-13 muted" style={{ background: 'transparent', border: 0 }}>Remove</button>
                </div>
              </div>
            ))}
          </div>

          <aside>
            <div className="card card-pad" style={{ position: 'sticky', top: 96 }}>
              <h3 style={{ fontSize: 18 }}>Summary</h3>
              <div className="flex justify-between mt-12">
                <span className="muted">Subtotal ({useApiCart ? apiItems.length : localItems.length} items)</span>
                <span className="fw-600">€{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mt-8">
                <span className="muted">Service fee</span>
                <span className="fw-600">€0</span>
              </div>
              <hr className="divider mt-16 mb-16" />
              <div className="flex justify-between" style={{ fontSize: 20, fontWeight: 700 }}>
                <span>Total</span>
                <span>€{total.toLocaleString()}</span>
              </div>
              <button
                className="btn btn-primary btn-block btn-lg mt-16"
                disabled={isEmpty || !user || confirmMutation.isPending}
                onClick={() => confirmMutation.mutate()}
              >
                {confirmMutation.isPending ? 'Confirming…' : 'Confirm reservation'}
              </button>
              {!user && !isEmpty && (
                <p className="text-12 muted mt-8" style={{ textAlign: 'center' }}>
                  <Link href="/auth" style={{ color: 'var(--primary)' }}>Sign in</Link> to confirm your reservation
                </p>
              )}
              <Link href="/search" className="btn btn-ghost btn-block mt-8">
                Continue shopping
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
}
