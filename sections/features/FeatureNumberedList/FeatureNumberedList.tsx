export type FeatureNumberedListItem = {
  title: string
  description: string
}

export type FeatureNumberedListProps = {
  heading?: string
  items: FeatureNumberedListItem[]
}

export function FeatureNumberedList({
  heading,
  items,
}: FeatureNumberedListProps) {
  return (
    <section className="px-6 py-16">
      {heading ? (
        <h2 className="mx-auto mb-10 max-w-3xl text-center text-3xl font-bold text-foreground">
          {heading}
        </h2>
      ) : null}
      <ol className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <li key={i} className="relative pl-14">
            <span className="absolute left-0 top-0 grid h-10 w-10 place-items-center rounded-full border-2 border-primary text-sm font-bold text-primary">
              {String(i + 1).padStart(2, '0')}
            </span>
            <h3 className="mb-1 text-base font-semibold text-foreground">
              {it.title}
            </h3>
            <p className="text-sm text-muted-foreground">{it.description}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
