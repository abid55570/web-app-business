export type HamburgerOverlayLink = {
  label: string
  href: string
  description?: string
}

export type HamburgerOverlayProps = {
  id?: string
  brand: string
  primary: HamburgerOverlayLink[]
  secondary?: HamburgerOverlayLink[]
}

export function HamburgerOverlay({
  id = 'hamburger-overlay',
  brand,
  primary,
  secondary,
}: HamburgerOverlayProps) {
  return (
    <>
      <header className="flex items-center justify-between border-b border-border bg-surface-raised px-6 py-4">
        <p className="text-lg font-bold text-foreground">{brand}</p>
        <a
          href={`#${id}`}
          aria-label="Open menu"
          className="grid h-10 w-10 place-items-center rounded-md border border-border text-foreground hover:bg-accent"
        >
          <span aria-hidden className="text-xl">≡</span>
        </a>
      </header>
      <div
        id={id}
        role="dialog"
        aria-modal="true"
        aria-label={`${brand} menu`}
        className="invisible fixed inset-0 z-50 bg-surface-base opacity-0 transition-all target:visible target:opacity-100 [&:target]:visible [&:target]:opacity-100"
      >
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          <p className="text-lg font-bold text-foreground">{brand}</p>
          <a
            href="#"
            aria-label="Close menu"
            className="grid h-10 w-10 place-items-center rounded-md border border-border text-foreground hover:bg-accent"
          >
            <span aria-hidden className="text-2xl">×</span>
          </a>
        </header>
        <nav className="mx-auto max-w-2xl px-6 py-10">
          <ul className="space-y-3">
            {primary.map((l, i) => (
              <li key={i}>
                <a
                  href={l.href}
                  className="group block rounded-lg border border-border bg-surface-raised p-5 hover:border-primary"
                >
                  <p className="text-xl font-bold text-foreground group-hover:text-primary">
                    {l.label} →
                  </p>
                  {l.description ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {l.description}
                    </p>
                  ) : null}
                </a>
              </li>
            ))}
          </ul>
          {secondary?.length ? (
            <ul className="mt-8 flex flex-wrap gap-4 text-sm text-muted-foreground">
              {secondary.map((l, i) => (
                <li key={i}>
                  <a href={l.href} className="hover:text-foreground">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </nav>
      </div>
    </>
  )
}
