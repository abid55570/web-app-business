export type FaqStackMinimalProps = {
  heading?: string
  items: { q: string; a: string }[]
}

export function FaqStackMinimal({ heading, items }: FaqStackMinimalProps) {
  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-2xl">
        {heading ? (
          <h2 className="mb-8 text-2xl font-semibold text-foreground">
            {heading}
          </h2>
        ) : null}
        <dl className="divide-y divide-border">
          {items.map((it, i) => (
            <div key={i} className="py-5">
              <dt className="mb-1 text-base font-semibold text-foreground">
                {it.q}
              </dt>
              <dd className="text-base text-muted-foreground">{it.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
