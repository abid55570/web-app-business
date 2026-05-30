export type FaqGridItem = {
  q: string
  a: string
}

export type FaqGridProps = {
  heading: string
  items: FaqGridItem[]
}

export function FaqGrid({ heading, items }: FaqGridProps) {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-3xl font-bold text-foreground">{heading}</h2>
        <ul className="mt-10 grid gap-8 sm:grid-cols-2">
          {items.map((it, i) => (
            <li key={i}>
              <p className="font-semibold text-foreground">{it.q}</p>
              <p className="mt-2 text-sm text-muted-foreground">{it.a}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
