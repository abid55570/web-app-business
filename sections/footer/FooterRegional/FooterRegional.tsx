export type FooterRegionalProps = {
  brand: string
  region: string
  regions: { code: string; label: string; href: string }[]
  legalLinks: { label: string; href: string }[]
  copyright?: string
}
export function FooterRegional({ brand, region, regions, legalLinks, copyright }: FooterRegionalProps) {
  return (
    <footer className="border-t border-border bg-surface-raised px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <p className="text-lg font-black text-foreground">{brand}</p>
        <details className="relative">
          <summary className="cursor-pointer list-none rounded-md border border-border bg-surface-base px-3 py-1.5 text-xs font-medium text-foreground">🌍 {region} ▾</summary>
          <ul className="absolute right-0 z-10 mt-1 min-w-[200px] rounded-md border border-border bg-surface-raised py-1 shadow-xl">
            {regions.map((r) => (
              <li key={r.code}><a href={r.href} className="block px-3 py-1.5 text-xs text-foreground hover:bg-surface-overlay">{r.label} <span className="font-mono text-[10px] text-muted-foreground">{r.code}</span></a></li>
            ))}
          </ul>
        </details>
      </div>
      <div className="mx-auto mt-4 flex max-w-6xl flex-wrap justify-between gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
        <ul className="flex flex-wrap gap-4">
          {legalLinks.map((l, i) => <li key={i}><a href={l.href}>{l.label}</a></li>)}
        </ul>
        {copyright ? <p>{copyright}</p> : null}
      </div>
    </footer>
  )
}
