interface Props {
  stars: 1 | 2 | 3;
}

export default function StarRating({ stars }: Props) {
  return (
    <div className="star-rating">
      {[1, 2, 3].map(n => (
        <span
          key={n}
          className={`star ${n <= stars ? 'star-filled' : 'star-empty'}`}
          style={{ animationDelay: n <= stars ? `${(n - 1) * 150}ms` : '0ms' }}
        >
          {n <= stars ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
}
