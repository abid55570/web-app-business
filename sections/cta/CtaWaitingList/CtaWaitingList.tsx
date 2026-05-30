export type CtaWaitingListProps = {
  heading: string
  body?: string
  spotsClaimed?: number
  totalSpots?: number
  emailPlaceholder?: string
  submitLabel?: string
}

export function CtaWaitingList({
  heading,
  body,
  spotsClaimed,
  totalSpots,
  emailPlaceholder = 'you@company.com',
  submitLabel = 'Reserve my spot',
}: CtaWaitingListProps) {
  const pct =
    spotsClaimed !== undefined && totalSpots
      ? Math.min(100, Math.round((spotsClaimed / totalSpots) * 100))
      : null
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-xl rounded-3xl border border-border bg-surface-raised p-8 text-center shadow-lg">
        <h2 className="mb-3 text-3xl font-bold text-foreground">{heading}</h2>
        {body ? (
          <p className="mb-6 text-sm text-muted-foreground">{body}</p>
        ) : null}
        {pct !== null ? (
          <>
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-primary">
              {spotsClaimed} of {totalSpots} spots claimed
            </p>
            <div className="mb-6 h-2 overflow-hidden rounded-full bg-surface-overlay">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${pct}%` }}
              />
            </div>
          </>
        ) : null}
        <form className="flex gap-2">
          <input
            type="email"
            required
            placeholder={emailPlaceholder}
            className="flex-1 rounded-md border border-border bg-surface-base px-3 py-2 text-sm text-foreground"
          />
          <button
            type="submit"
            className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
          >
            {submitLabel}
          </button>
        </form>
      </div>
    </section>
  )
}
