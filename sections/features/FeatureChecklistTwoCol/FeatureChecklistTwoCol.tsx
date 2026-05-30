export type FeatureChecklistTwoColProps = {
  heading?: string
  subheading?: string
  items: string[]
}

export function FeatureChecklistTwoCol({
  heading,
  subheading,
  items,
}: FeatureChecklistTwoColProps) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-4xl">
        {heading ? (
          <h2 className="mb-3 text-3xl font-bold text-foreground">{heading}</h2>
        ) : null}
        {subheading ? (
          <p className="mb-8 text-base text-muted-foreground">{subheading}</p>
        ) : null}
        <ul className="grid gap-4 sm:grid-cols-2">
          {items.map((it, i) => (
            <li key={i} className="flex items-start gap-3 text-base text-foreground">
              <span
                aria-hidden
                className="mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
              >
                ✓
              </span>
              <span>{it}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
