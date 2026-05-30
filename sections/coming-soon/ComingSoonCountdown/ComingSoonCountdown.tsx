export type ComingSoonCountdownProps = {
  brand?: string
  heading: string
  body?: string
  daysLeft: number
  hoursLeft: number
  minutesLeft: number
  emailCaptureLabel?: string
}

export function ComingSoonCountdown({
  brand,
  heading,
  body,
  daysLeft,
  hoursLeft,
  minutesLeft,
  emailCaptureLabel = 'Notify me at launch',
}: ComingSoonCountdownProps) {
  const tiles = [
    { value: daysLeft, label: 'days' },
    { value: hoursLeft, label: 'hours' },
    { value: minutesLeft, label: 'mins' },
  ]
  return (
    <section className="grid min-h-[80vh] place-items-center bg-gradient-to-br from-primary/10 to-accent/10 px-6">
      <div className="max-w-xl text-center">
        {brand ? (
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">
            {brand}
          </p>
        ) : null}
        <h1 className="mb-3 text-4xl font-bold text-foreground sm:text-5xl">
          {heading}
        </h1>
        {body ? (
          <p className="mb-8 text-base text-muted-foreground">{body}</p>
        ) : null}
        <div className="mb-8 flex justify-center gap-3">
          {tiles.map((t) => (
            <div
              key={t.label}
              className="grid h-24 w-24 place-items-center rounded-xl border border-border bg-surface-raised text-3xl font-black text-foreground"
            >
              {t.value}
              <span className="text-[10px] font-normal uppercase tracking-wider text-muted-foreground">
                {t.label}
              </span>
            </div>
          ))}
        </div>
        <form className="mx-auto flex max-w-sm gap-2">
          <input
            type="email"
            required
            placeholder="you@example.com"
            className="flex-1 rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-foreground"
          />
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            {emailCaptureLabel}
          </button>
        </form>
      </div>
    </section>
  )
}
