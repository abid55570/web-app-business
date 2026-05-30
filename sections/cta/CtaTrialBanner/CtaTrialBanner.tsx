export type CtaTrialBannerProps = {
  heading: string
  trialDays: number
  body?: string
  startLabel?: string
  startHref?: string
  noCardCopy?: string
}

export function CtaTrialBanner({
  heading,
  trialDays,
  body,
  startLabel = 'Start free trial',
  startHref = '#',
  noCardCopy = 'No credit card required',
}: CtaTrialBannerProps) {
  return (
    <section className="px-6 py-12">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-6 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 p-8">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-primary">
            {trialDays}-day free trial
          </p>
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            {heading}
          </h2>
          {body ? (
            <p className="mt-2 text-sm text-muted-foreground">{body}</p>
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-2">
          <a
            href={startHref}
            className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            {startLabel}
          </a>
          <p className="text-xs text-muted-foreground">{noCardCopy}</p>
        </div>
      </div>
    </section>
  )
}
