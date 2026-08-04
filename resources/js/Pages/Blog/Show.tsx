import { useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../../lib/api';
import PublicLayout from '../../Layouts/PublicLayout';

interface ShowProps {
  slug?: string;
}

export default function BlogShow({ slug: slugProp }: ShowProps) {
  const pageProps = usePage().props as ShowProps;
  const slug = slugProp ?? pageProps.slug;

  const { data: postData, isError } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => publicApi.blogPost(slug!),
    enabled: !!slug,
    retry: false,
  });

  const post = (!isError && postData) ? postData : null;

  useEffect(() => {
    if (post?.title) {
      document.title = `${post.title} | Wedbi`;
      return () => { document.title = 'Wedbi'; };
    }
  }, [post?.title]);

  if (isError || (!postData && !post)) return (
    <PublicLayout>
      <div className="container" style={{ padding: '80px 28px', textAlign: 'center', maxWidth: 760 }}>
        <Link href="/blog" className="text-13 muted">← Back to stories</Link>
        <h2 className="mt-20">Post not found</h2>
        <p className="muted mt-12">This article may have been moved or removed.</p>
      </div>
    </PublicLayout>
  );

  if (!post) return (
    <PublicLayout>
      <div className="container" style={{ padding: '80px 28px', textAlign: 'center', maxWidth: 760 }}>
        <div className="muted">Loading…</div>
      </div>
    </PublicLayout>
  );

  return (
    <PublicLayout>
      <div className="container" style={{ padding: '40px 28px 80px', maxWidth: 760 }}>
        <Link href="/blog" className="text-13 muted">← Back to stories</Link>
        <h1 className="mt-16" style={{ fontSize: 44 }}>{post.title}</h1>
        <div className="muted mt-8">by {post.author} · {post.readTime} min · {post.date}</div>
        {post.cover && <img src={post.cover} alt="" style={{ width: '100%', borderRadius: 20, marginTop: 24, aspectRatio: '16/9', objectFit: 'cover' }} />}
        <div className="mt-24" style={{ fontSize: 17, lineHeight: 1.75, color: 'var(--ink-2)' }}>
          {post.body
            ? <div dangerouslySetInnerHTML={{ __html: post.body }} />
            : <p>{post.excerpt}</p>
          }
        </div>
      </div>
    </PublicLayout>
  );
}
