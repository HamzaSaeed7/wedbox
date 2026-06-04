import { Link } from '@inertiajs/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Icon from '../shared/Icon';
import { useStore, useAuthUser } from '../../store';
import { cartApi } from '../../lib/api';


export default function CartDrawer() {
  const { cart, removeFromCart, cartOpen, setCartOpen } = useStore();
  const user = useAuthUser();
  const qc = useQueryClient();

  const { data: apiCartData } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.get(),
    enabled: !!user,
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => cartApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });

  const useApiCart = !!user;
  const apiItems: {
    id: number;
    price: number;
    note?: string;
    service: { title: string; images: string[] | { url: string }[]; location?: string };
  }[] = Array.isArray(apiCartData) ? apiCartData : [];

  const total = useApiCart
    ? apiItems.reduce((s, i) => s + Number(i.price || 0), 0)
    : cart.reduce((sum, i) => sum + (i.price || 0), 0);

  const isEmpty = useApiCart ? apiItems.length === 0 : cart.length === 0;

  const firstImg = (imgs: string[] | { url: string }[]): string => {
    if (!imgs?.length) return '';
    const first = imgs[0];
    return typeof first === 'string' ? first : first.url;
  };

  if (!cartOpen) return null;

  return (
    <>
      <div className="cart-drawer-mask" onClick={() => setCartOpen(false)} />
      <aside className="cart-drawer">
        <div
          className="flex items-center justify-between"
          style={{ padding: '22px 24px', borderBottom: '1px solid var(--line)' }}
        >
          <h3 style={{ fontSize: 20 }}>Your cart</h3>
          <button onClick={() => setCartOpen(false)} className="btn-ghost btn btn-sm" style={{ padding: 8 }}>
            <Icon name="close" size={16} />
          </button>
        </div>

        <div style={{ padding: '8px 24px', overflow: 'auto', flex: 1 }}>
          {isEmpty && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
              <Icon name="cart" size={48} color="var(--line)" />
              <div className="mt-16">Your cart is empty.</div>
            </div>
          )}

          {useApiCart && apiItems.map((item) => (
            <div key={item.id} className="flex gap-12" style={{ padding: '14px 0', borderBottom: '1px solid var(--line-2)' }}>
              <img
                src={firstImg(item.service?.images ?? [])}
                alt=""
                style={{ width: 72, height: 72, borderRadius: 12, objectFit: 'cover' }}
              />
              <div style={{ flex: 1 }}>
                <div className="fw-600 text-14">{item.service?.title}</div>
                <div className="muted text-12 mt-4">{item.note || item.service?.location}</div>
                <div className="flex items-center justify-between mt-8">
                  <span className="fw-700">€{Number(item.price || 0).toLocaleString()}</span>
                  <button
                    onClick={() => removeMutation.mutate(item.id)}
                    disabled={removeMutation.isPending}
                    className="muted text-12"
                    style={{ background: 'transparent', border: 0 }}
                  >Remove</button>
                </div>
              </div>
            </div>
          ))}

          {!useApiCart && cart.map((item) => (
            <div key={item.id} className="flex gap-12" style={{ padding: '14px 0', borderBottom: '1px solid var(--line-2)' }}>
              {item.serviceImage
                ? <img src={item.serviceImage} alt="" style={{ width: 72, height: 72, borderRadius: 12, objectFit: 'cover' }} />
                : <div style={{ width: 72, height: 72, borderRadius: 12, background: 'var(--bg-3)', flexShrink: 0 }} />
              }
              <div style={{ flex: 1 }}>
                <div className="fw-600 text-14">{item.serviceTitle ?? 'Service'}</div>
                <div className="muted text-12 mt-4">{item.detailSummary}</div>
                <div className="flex items-center justify-between mt-8">
                  <span className="fw-700">€{(item.price || 0).toLocaleString()}</span>
                  <button onClick={() => removeFromCart(item.id)} className="muted text-12" style={{ background: 'transparent', border: 0 }}>Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid var(--line)', padding: 24 }}>
          <div className="flex items-center justify-between" style={{ fontWeight: 700, fontSize: 18 }}>
            <span>Total</span>
            <span>€{total.toLocaleString()}</span>
          </div>
          {!isEmpty ? (
            <Link
              href="/cart"
              onClick={() => setCartOpen(false)}
              className="btn btn-primary btn-block btn-lg mt-16"
              style={{ display: 'flex', justifyContent: 'center', textDecoration: 'none' }}
            >
              Continue to checkout
            </Link>
          ) : (
            <button className="btn btn-primary btn-block btn-lg mt-16" disabled>
              Continue to checkout
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
