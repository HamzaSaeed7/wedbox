interface StarsProps {
  value?: number;
  size?: number;
}

export default function Stars({ value = 5, size = 14 }: StarsProps) {
  const filled = Math.round(value);
  return (
    <span className="stars" aria-label={`${value} stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width={size} height={size} viewBox="0 0 24 24" fill={n <= filled ? '#F7C24A' : '#E5ECEC'}>
          <path d="M12 3.5 14.5 9l6 .5-4.6 4 1.4 6L12 16.7 6.7 19.5l1.4-6L3.5 9.5l6-.5L12 3.5Z" />
        </svg>
      ))}
    </span>
  );
}
