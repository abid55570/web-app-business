export type FeaturesIconRowItem = { icon: string; label: string }
export type FeaturesIconRowProps = { items: FeaturesIconRowItem[] }
export function FeaturesIconRow({ items }: FeaturesIconRowProps) {
  return (
    <section className="border-y border-border bg-surface-raised px-6 py-6">
      <ul className="mx-auto grid max-w-5xl grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <span aria-hidden className="text-xl">{it.icon}</span>
            <span className="font-medium text-foreground">{it.label}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
