export type HighlightItem = {
  label: string
  icon?: string
}

export type HighlightsProps = {
  heading?: string
  items: HighlightItem[]
}

export function Highlights({ heading, items }: HighlightsProps) {
  return (
    <section className="my-8 rounded-xl border border-border bg-surface-sunken p-6">
      {heading ? (
        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {heading}
        </p>
      ) : null}
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
            <span aria-hidden className="mt-0.5 text-primary">
              {it.icon ?? '★'}
            </span>
            {it.label}
          </li>
        ))}
      </ul>
    </section>
  )
}
