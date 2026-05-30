export type NavMegaWithImagesProps = {
  brand: string
  cards: { title: string; description: string; imageUrl: string; href: string }[]
}
export function NavMegaWithImages({ brand, cards }: NavMegaWithImagesProps) {
  return (
    <header className="border-b border-border bg-surface-raised">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <span className="text-lg font-bold text-foreground">{brand}</span>
        <details className="group relative">
          <summary className="cursor-pointer list-none text-sm font-medium text-foreground">Solutions ▾</summary>
          <div className="absolute right-0 z-10 mt-3 w-[680px] rounded-xl border border-border bg-surface-raised p-4 shadow-xl">
            <ul className="grid grid-cols-2 gap-4">
              {cards.map((c, i) => (
                <li key={i}>
                  <a href={c.href} className="flex gap-3 rounded-lg p-3 hover:bg-surface-overlay">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.imageUrl} alt="" className="h-16 w-24 flex-shrink-0 rounded object-cover" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{c.title}</p>
                      <p className="text-xs text-muted-foreground">{c.description}</p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </details>
      </div>
    </header>
  )
}
