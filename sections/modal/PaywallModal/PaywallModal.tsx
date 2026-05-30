export type PaywallModalProps = {
  id: string
  badgeLabel?: string
  title: string
  body: string
  features: string[]
  primaryLabel?: string
  primaryHref: string
  secondaryLabel?: string
  secondaryHref?: string
}

export function PaywallModal({
  id,
  badgeLabel = 'Pro feature',
  title,
  body,
  features,
  primaryLabel = 'Upgrade now',
  primaryHref,
  secondaryLabel = 'Not now',
  secondaryHref = '#',
}: PaywallModalProps) {
  return (
    <div
      id={id}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${id}-title`}
      className="invisible fixed inset-0 z-50 grid place-items-center bg-black/65 opacity-0 transition-opacity target:visible target:opacity-100 [&:target]:visible [&:target]:opacity-100"
    >
      <div className="w-full max-w-md rounded-xl bg-surface-raised p-6 shadow-2xl">
        <span className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">
          {badgeLabel}
        </span>
        <h2
          id={`${id}-title`}
          className="mt-3 text-2xl font-bold text-foreground"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{body}</p>
        <ul className="mt-5 space-y-2 text-sm text-foreground">
          {features.map((f, i) => (
            <li key={i} className="flex gap-2">
              <span aria-hidden className="text-primary">
                ✓
              </span>
              {f}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex justify-end gap-2">
          <a
            href={secondaryHref}
            className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
          >
            {secondaryLabel}
          </a>
          <a
            href={primaryHref}
            className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            {primaryLabel}
          </a>
        </div>
      </div>
    </div>
  )
}
