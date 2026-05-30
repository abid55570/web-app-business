export type BreadcrumbWithDropdownItem = {
  label: string
  href?: string
  siblings?: { label: string; href: string }[]
}

export type BreadcrumbWithDropdownProps = {
  items: BreadcrumbWithDropdownItem[]
}

export function BreadcrumbWithDropdown({
  items,
}: BreadcrumbWithDropdownProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="border-b border-border bg-surface-raised px-6 py-3"
    >
      <ol className="mx-auto flex max-w-6xl flex-wrap items-center gap-1 text-sm">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1">
            {it.siblings && it.siblings.length ? (
              <details className="relative">
                <summary className="cursor-pointer list-none rounded px-2 py-1 text-foreground hover:bg-surface-overlay">
                  {it.label} ▾
                </summary>
                <ul className="absolute left-0 top-full z-10 mt-1 min-w-[180px] rounded-md border border-border bg-surface-raised py-1 shadow-xl">
                  {it.siblings.map((s, j) => (
                    <li key={j}>
                      <a
                        href={s.href}
                        className="block px-3 py-1.5 text-sm text-foreground hover:bg-surface-overlay"
                      >
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            ) : it.href ? (
              <a
                href={it.href}
                className="rounded px-2 py-1 text-muted-foreground hover:bg-surface-overlay hover:text-foreground"
              >
                {it.label}
              </a>
            ) : (
              <span className="px-2 py-1 font-semibold text-foreground">
                {it.label}
              </span>
            )}
            {i < items.length - 1 ? (
              <span aria-hidden className="text-muted-foreground">
                /
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  )
}
