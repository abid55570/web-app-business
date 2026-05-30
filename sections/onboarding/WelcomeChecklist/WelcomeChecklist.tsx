export type WelcomeChecklistItem = {
  title: string
  description: string
  done?: boolean
  ctaLabel?: string
  ctaHref?: string
}

export type WelcomeChecklistProps = {
  heading?: string
  items: WelcomeChecklistItem[]
}

export function WelcomeChecklist({
  heading = 'Get started',
  items,
}: WelcomeChecklistProps) {
  const done = items.filter((i) => i.done).length
  const pct = items.length ? Math.round((done / items.length) * 100) : 0
  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <div className="mb-1 flex items-baseline justify-between">
            <h2 className="text-xl font-semibold text-foreground">{heading}</h2>
            <span className="text-xs font-mono text-muted-foreground">
              {done}/{items.length} · {pct}%
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-overlay">
            <div
              className="h-full bg-primary"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <ul className="space-y-2">
          {items.map((it, i) => (
            <li
              key={i}
              className={`flex items-start gap-3 rounded-lg border p-4 ${
                it.done
                  ? 'border-border bg-surface-overlay opacity-60'
                  : 'border-border bg-surface-raised'
              }`}
            >
              <span
                className={`mt-0.5 grid h-5 w-5 place-items-center rounded-full text-xs font-bold ${
                  it.done
                    ? 'bg-success-fg text-white'
                    : 'border-2 border-border text-muted-foreground'
                }`}
              >
                {it.done ? '✓' : i + 1}
              </span>
              <div className="flex-1">
                <p
                  className={`text-sm font-medium text-foreground ${
                    it.done ? 'line-through' : ''
                  }`}
                >
                  {it.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {it.description}
                </p>
              </div>
              {!it.done && it.ctaLabel ? (
                <a
                  href={it.ctaHref ?? '#'}
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                >
                  {it.ctaLabel}
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
