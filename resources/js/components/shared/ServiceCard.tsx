import { Link } from '@inertiajs/react';
import Icon from './Icon';
import { useStore } from '../../store';
import { CATEGORIES } from '../../lib/data';
import type { Service } from '../../lib/types';

interface ServiceCardProps {
  service: Service;
  hideFav?: boolean;
}

export default function ServiceCard({ service, hideFav = false }: ServiceCardProps) {
  const { favorites, toggleFav } = useStore();
  const cat = CATEGORIES.find((c) => c.slug === service.slug);
  const fav = favorites.has(service.id);

  return (
    <Link href={`/service/${service.id}`} className="svc-card card" style={{ textDecoration: 'none' }}>
      <div className="img">
        <img src={service.images[0]} alt={service.title} loading="lazy" />
        <span className="cat-badge">{cat?.name}</span>
        {!hideFav && (
          <button
            className={`fav ${fav ? 'active' : ''}`}
            aria-label="Favorite"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFav(service.id);
            }}
          >
            <Icon name={fav ? 'heart-filled' : 'heart'} size={16} />
          </button>
        )}
      </div>
      <div className="body">
        <div className="row1">
          <span className="title">{service.title}</span>
          <span className="rating">
            <Icon name="star" size={13} color="#F7C24A" /> {service.rating.toFixed(1)}
          </span>
        </div>
        <div className="meta">{service.location}</div>
        <div className="price">
          <span className="from">from </span>€{service.minimum_price.toLocaleString()}
        </div>
      </div>
    </Link>
  );
}
