export type FaqGroupedTabsGroup = {
  id: string
  label: string
  items: { q: string; a: string }[]
}

export type FaqGroupedTabsProps = {
  heading?: string
  groups: FaqGroupedTabsGroup[]
}

export function FaqGroupedTabs({ heading, groups }: FaqGroupedTabsProps) {
  return (
    <section className="px-6 py-16">
      {heading ? (
        <h2 className="mx-auto mb-6 max-w-3xl text-center text-3xl font-bold text-foreground">
          {heading}
        </h2>
      ) : null}
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-wrap gap-1 rounded-full border border-border bg-surface-raised p-1">
          {groups.map((g, i) => (
            <div key={g.id} className="flex">
              <input
                type="radio"
                id={`faqgt-${g.id}`}
                name="faqgt"
                className="peer hidden"
                defaultChecked={i === 0}
              />
              <label
                htmlFor={`faqgt-${g.id}`}
                className="cursor-pointer rounded-full px-4 py-1.5 text-sm peer-checked:bg-primary peer-checked:text-primary-foreground"
              >
                {g.label}
              </label>
            </div>
          ))}
        </div>
        <ul className="space-y-2">
          {groups.flatMap((g) =>
            g.items.map((it, j) => (
              <li
                key={`${g.id}-${j}`}
                className="rounded-lg border border-border bg-surface-raised"
              >
                <details>
                  <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-foreground">
                    {it.q}
                  </summary>
                  <div className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
                    {it.a}
                  </div>
                </details>
              </li>
            )),
          )}
        </ul>
      </div>
    </section>
  )
}
