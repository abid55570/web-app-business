export type BlogReadingProgressProps = {
  title: string
  author: string
  readingTimeMinutes: number
  publishedAt: string
}

export function BlogReadingProgress({
  title,
  author,
  readingTimeMinutes,
  publishedAt,
}: BlogReadingProgressProps) {
  return (
    <div className="sticky top-0 z-30 border-b border-border bg-surface-raised/95 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {title}
          </p>
          <p className="text-xs text-muted-foreground">
            {author} · {publishedAt} · {readingTimeMinutes} min read
          </p>
        </div>
        <div
          className="h-1.5 w-32 overflow-hidden rounded-full bg-surface-sunken"
          aria-hidden
        >
          {/* Animated via tiny CSS — width=scroll% wired in via vanilla script in the host doc. */}
          <span
            className="block h-full bg-primary"
            style={{ width: 'var(--reading-progress, 0%)' }}
          />
        </div>
      </div>
    </div>
  )
}
