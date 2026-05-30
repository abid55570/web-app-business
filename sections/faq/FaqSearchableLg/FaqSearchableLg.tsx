export type FaqSearchableLgGroup = { label: string; items: { q: string; a: string }[] }
export type FaqSearchableLgProps = { heading?: string; placeholder?: string; groups: FaqSearchableLgGroup[] }
export function FaqSearchableLg({ heading, placeholder = 'Search the help center…', groups }: FaqSearchableLgProps) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-3xl">
        {heading ? <h2 className="mb-6 text-center text-3xl font-bold text-foreground">{heading}</h2> : null}
        <input type="search" placeholder={placeholder} className="mb-10 w-full rounded-lg border border-border bg-surface-raised px-4 py-3 text-base text-foreground" />
        {groups.map((g, i) => (
          <div key={i} className="mb-8">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">{g.label}</h3>
            <ul className="space-y-2">
              {g.items.map((it, j) => (
                <li key={j} className="rounded-lg border border-border bg-surface-raised">
                  <details>
                    <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-foreground">{it.q}</summary>
                    <p className="border-t border-border px-4 py-3 text-sm text-muted-foreground">{it.a}</p>
                  </details>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
