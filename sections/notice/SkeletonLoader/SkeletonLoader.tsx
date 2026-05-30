export type SkeletonLoaderProps = {
  variant?: 'card' | 'list' | 'article'
  count?: number
}

export function SkeletonLoader({
  variant = 'card',
  count = 3,
}: SkeletonLoaderProps) {
  const items = Array.from({ length: count })
  if (variant === 'list') {
    return (
      <ul className="space-y-3">
        {items.map((_, i) => (
          <li
            key={i}
            className="flex items-center gap-3 rounded-md border border-border bg-surface-raised p-3"
          >
            <span className="h-10 w-10 animate-pulse rounded-full bg-surface-sunken" />
            <div className="flex-1 space-y-1.5">
              <span className="block h-3 w-2/3 animate-pulse rounded bg-surface-sunken" />
              <span className="block h-2 w-1/3 animate-pulse rounded bg-surface-sunken" />
            </div>
          </li>
        ))}
      </ul>
    )
  }
  if (variant === 'article') {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <span className="block h-6 w-3/4 animate-pulse rounded bg-surface-sunken" />
        <span className="block h-3 w-1/3 animate-pulse rounded bg-surface-sunken" />
        <span className="block h-48 w-full animate-pulse rounded-lg bg-surface-sunken" />
        {items.map((_, i) => (
          <span
            key={i}
            className="block h-3 w-full animate-pulse rounded bg-surface-sunken"
          />
        ))}
      </div>
    )
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-surface-raised p-5"
        >
          <span className="block h-32 w-full animate-pulse rounded-md bg-surface-sunken" />
          <span className="mt-4 block h-4 w-2/3 animate-pulse rounded bg-surface-sunken" />
          <span className="mt-2 block h-3 w-1/2 animate-pulse rounded bg-surface-sunken" />
        </div>
      ))}
    </div>
  )
}
