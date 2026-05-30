export type CtaInlineProps = {
  message: string
  ctaLabel: string
  ctaHref: string
  variant?: 'default' | 'gradient'
}

export function CtaInline({
  message,
  ctaLabel,
  ctaHref,
  variant = 'default',
}: CtaInlineProps) {
  const bg =
    variant === 'gradient'
      ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground'
      : 'bg-surface-raised text-foreground'
  return (
    <aside
      className={`my-8 flex flex-col items-center justify-between gap-4 rounded-xl border border-border px-6 py-5 sm:flex-row ${bg}`}
    >
      <p className="text-base font-semibold">{message}</p>
      <a
        href={ctaHref}
        className={`inline-flex items-center rounded-lg px-5 py-2 text-sm font-semibold ${
          variant === 'gradient'
            ? 'bg-surface-raised text-foreground hover:opacity-90'
            : 'bg-primary text-primary-foreground hover:opacity-90'
        }`}
      >
        {ctaLabel} →
      </a>
    </aside>
  )
}
