export type UpsellModalProps = {
  id?: string
  triggerLabel?: string
  heading: string
  body: string
  perks: string[]
  primaryCtaLabel: string
  primaryCtaHref?: string
  dismissLabel?: string
}

export function UpsellModal({
  id = 'upsell-modal',
  triggerLabel = 'Upgrade…',
  heading,
  body,
  perks,
  primaryCtaLabel,
  primaryCtaHref = '#',
  dismissLabel = 'Not now',
}: UpsellModalProps) {
  return (
    <section className="px-6 py-12">
      <div className="text-center">
        <a
          href={`#${id}`}
          className="inline-block rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg"
        >
          {triggerLabel}
        </a>
      </div>
      <div
        id={id}
        className="invisible fixed inset-0 z-50 grid place-items-center bg-black/70 opacity-0 transition target:visible target:opacity-100"
      >
        <div className="w-full max-w-md rounded-2xl bg-surface-raised p-8 shadow-2xl">
          <h3 className="mb-2 text-2xl font-bold text-foreground">{heading}</h3>
          <p className="mb-4 text-sm text-muted-foreground">{body}</p>
          <ul className="mb-6 space-y-2 text-sm text-foreground">
            {perks.map((p, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-0.5 text-primary">✓</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2">
            <a
              href={primaryCtaHref}
              className="rounded-lg bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-center text-sm font-semibold text-white"
            >
              {primaryCtaLabel}
            </a>
            <a
              href="#"
              className="rounded-lg px-5 py-2 text-center text-sm font-medium text-muted-foreground hover:bg-surface-overlay"
            >
              {dismissLabel}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
