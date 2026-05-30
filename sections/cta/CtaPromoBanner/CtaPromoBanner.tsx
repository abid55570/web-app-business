export type CtaPromoBannerProps = {
  message: string
  ctaLabel: string
  ctaHref: string
  endsAt?: string
}

export function CtaPromoBanner({
  message,
  ctaLabel,
  ctaHref,
  endsAt,
}: CtaPromoBannerProps) {
  return (
    <div className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3 text-sm">
        <p className="font-medium">
          {message}
          {endsAt ? (
            <span className="ml-2 opacity-80">· ends {endsAt}</span>
          ) : null}
        </p>
        <a
          href={ctaHref}
          className="rounded-full bg-surface-raised px-4 py-1.5 text-xs font-semibold text-foreground hover:opacity-90"
        >
          {ctaLabel} →
        </a>
      </div>
    </div>
  )
}
