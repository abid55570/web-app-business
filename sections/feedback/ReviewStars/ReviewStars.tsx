export type ReviewStarsProps = {
  rating: number
  count?: number
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_CLASS: Record<NonNullable<ReviewStarsProps['size']>, string> = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-3xl',
}

export function ReviewStars({
  rating,
  count,
  size = 'md',
}: ReviewStarsProps) {
  const clamped = Math.max(0, Math.min(5, rating))
  return (
    <div
      role="img"
      aria-label={`${clamped.toFixed(1)} out of 5 stars${count ? `, ${count} reviews` : ''}`}
      className="inline-flex items-center gap-2"
    >
      <span className={`tracking-tight text-amber-500 ${SIZE_CLASS[size]}`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} aria-hidden="true">
            {clamped >= i
              ? '★'
              : clamped >= i - 0.5
                ? '⯨'
                : '☆'}
          </span>
        ))}
      </span>
      <span className="text-sm font-medium text-foreground">
        {clamped.toFixed(1)}
      </span>
      {count != null ? (
        <span className="text-xs text-muted-foreground">
          ({count} review{count === 1 ? '' : 's'})
        </span>
      ) : null}
    </div>
  )
}
