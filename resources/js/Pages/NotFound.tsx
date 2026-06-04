import { Link } from '@inertiajs/react';
import PublicLayout from '../Layouts/PublicLayout';

export default function NotFound() {
  return (
    <PublicLayout>
      <div className="container" style={{ padding: '80px 28px', textAlign: 'center' }}>
        <div style={{ fontSize: 80 }}>💍</div>
        <h1>Page not found</h1>
        <p className="muted mt-12">Looks like that link drifted off the registry.</p>
        <Link href="/" className="btn btn-primary mt-16">Back home</Link>
      </div>
    </PublicLayout>
  );
}
