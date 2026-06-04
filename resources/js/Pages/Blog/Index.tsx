import { Link } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../../lib/api';
import PublicLayout from '../../Layouts/PublicLayout';

export default function BlogIndex() {
  const { data: blogData } = useQuery({
    queryKey: ['blog'],
    queryFn: () => publicApi.blog(),
    staleTime: 5 * 60 * 1000,
  });

  const posts: { id: number; slug: string; title: string; excerpt: string; cover: string; author: string; readTime: number; date: string; category?: string }[] =
    Array.isArray(blogData) ? blogData : [];

  if (posts.length === 0) {
    return (
      <PublicLayout>
        <div className="container" style={{ padding: '60px 28px', textAlign: 'center' }}>
          <p className="muted">No posts yet. Check back soon.</p>
        </div>
      </PublicLayout>
    );
  }

  const hero = posts[0];
  const rest = posts.slice(1, 4);

  return (
    <PublicLayout>
      <div className="container-wide" style={{ padding: '40px 28px 60px' }}>
        <div className="muted text-13 fw-600">STORIES</div>
        <h1 className="mt-4" style={{ fontSize: 44 }}>Inspiration &amp; tips for planning</h1>
        <p className="muted mt-8" style={{ maxWidth: 560 }}>Real weddings, budget breakdowns and the trends our editorial team is watching.</p>
        <div className="grid r-grid-halves mt-32" style={{ gap: 24 }}>
          <Link href={`/blog/${hero.slug}`} className="card" style={{ overflow: 'hidden' }}>
            <img src={hero.cover} alt="" style={{ width: '100%', height: 460, objectFit: 'cover' }} />
            <div style={{ padding: 24 }}>
              <span className="chip chip-soft">{hero.category || 'Editorial'}</span>
              <h2 className="mt-12" style={{ fontSize: 30 }}>{hero.title}</h2>
              <p className="muted mt-12">{hero.excerpt}</p>
              <div className="muted text-13 mt-12">by {hero.author} · {hero.readTime} min read</div>
            </div>
          </Link>
          <div className="flex" style={{ flexDirection: 'column', gap: 16 }}>
            {rest.map((p) => (
              <Link key={p.id} href={`/blog/${p.slug}`} className="card flex gap-12" style={{ overflow: 'hidden' }}>
                <img src={p.cover} alt="" style={{ width: 140, height: 110, objectFit: 'cover' }} />
                <div style={{ padding: '12px 14px 12px 0' }}>
                  <div className="fw-600 text-14" style={{ lineHeight: 1.3 }}>{p.title}</div>
                  <div className="muted text-12 mt-8">{p.author} · {p.readTime} min</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
