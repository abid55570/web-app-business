export type CelebrationModalProps = {
  id?: string
  triggerLabel?: string
  heading: string
  body: string
  ctaLabel?: string
  ctaHref?: string
}

export function CelebrationModal({
  id = 'celebration-modal',
  triggerLabel = 'Show celebration',
  heading,
  body,
  ctaLabel = 'Continue',
  ctaHref = '#',
}: CelebrationModalProps) {
  return (
    <section className="px-6 py-12">
      <div className="text-center">
        <a
          href={`#${id}`}
          className="inline-block rounded-full bg-gradient-to-r from-success-fg to-primary px-5 py-2.5 text-sm font-semibold text-white"
        >
          {triggerLabel}
        </a>
      </div>
      <div
        id={id}
        className="invisible fixed inset-0 z-50 grid place-items-center bg-black/60 opacity-0 transition target:visible target:opacity-100"
      >
        <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-surface-raised p-8 text-center shadow-2xl">
          <div
            aria-hidden
            className="absolute inset-x-0 -top-6 h-12 bg-gradient-to-r from-primary via-accent to-warning-fg blur-2xl opacity-60"
          />
          <p className="mb-2 text-6xl">🎉</p>
          <h3 className="mb-2 text-2xl font-bold text-foreground">{heading}</h3>
          <p className="mb-6 text-sm text-muted-foreground">{body}</p>
          <a
            href={ctaHref}
            className="block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            {ctaLabel}
          </a>
        </div>
      </div>
    </section>
  )
}
