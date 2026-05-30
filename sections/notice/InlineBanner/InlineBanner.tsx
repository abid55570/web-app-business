export type InlineBannerProps = {
  variant?: 'info' | 'success' | 'warning' | 'error'
  title: string
  body?: string
  ctaLabel?: string
  ctaHref?: string
}

const PALETTE: Record<NonNullable<InlineBannerProps['variant']>, string> = {
  info: 'border-l-blue-500 bg-blue-50 text-blue-900',
  success: 'border-l-emerald-500 bg-emerald-50 text-emerald-900',
  warning: 'border-l-amber-500 bg-amber-50 text-amber-900',
  error: 'border-l-red-500 bg-red-50 text-red-900',
}

export function InlineBanner({
  variant = 'info',
  title,
  body,
  ctaLabel,
  ctaHref,
}: InlineBannerProps) {
  return (
    <div
      role="status"
      className={`flex items-start gap-3 rounded-md border border-l-4 border-transparent px-4 py-3 ${PALETTE[variant]}`}
    >
      <div className="flex-1 text-sm">
        <p className="font-semibold">{title}</p>
        {body ? <p className="mt-1 opacity-80">{body}</p> : null}
      </div>
      {ctaLabel && ctaHref ? (
        <a
          href={ctaHref}
          className="rounded-md bg-current/10 px-3 py-1.5 text-xs font-semibold hover:bg-current/20"
        >
          {ctaLabel}
        </a>
      ) : null}
    </div>
  )
}
