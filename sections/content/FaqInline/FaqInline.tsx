export type FaqInlineItem = {
  q: string
  a: string
}

export type FaqInlineProps = {
  items: FaqInlineItem[]
}

export function FaqInline({ items }: FaqInlineProps) {
  return (
    <section className="mx-auto my-6 max-w-3xl rounded-xl border border-border bg-surface-sunken p-1">
      <ul className="divide-y divide-border">
        {items.map((it, i) => (
          <li key={i}>
            <details className="group p-4">
              <summary className="flex cursor-pointer items-start justify-between gap-3 text-sm font-semibold text-foreground list-none">
                {it.q}
                <span
                  aria-hidden
                  className="mt-0.5 text-xl text-muted-foreground transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">{it.a}</p>
            </details>
          </li>
        ))}
      </ul>
    </section>
  )
}
