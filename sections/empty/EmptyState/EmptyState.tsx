export type EmptyStateProps = {
  title: string
  body?: string
  icon?: string
  ctaLabel?: string
  ctaHref?: string
}

export function EmptyState({
  title,
  body,
  icon = '📭',
  ctaLabel,
  ctaHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 py-16 text-center">
      <p className="mb-4 text-4xl" aria-hidden="true">
        {icon}
      </p>
      <p className="mb-2 text-lg font-semibold text-foreground">{title}</p>
      {body ? (
        <p className="mb-6 max-w-md text-sm text-muted-foreground">{body}</p>
      ) : null}
      {ctaLabel ? (
        <a
          href={ctaHref ?? '#'}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          {ctaLabel}
        </a>
      ) : null}
    </div>
  )
}
