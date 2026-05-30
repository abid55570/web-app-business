export type NavBreadcrumbActionsCrumb = {
  label: string
  href?: string
}

export type NavBreadcrumbActionsAction = {
  label: string
  href: string
  primary?: boolean
}

export type NavBreadcrumbActionsProps = {
  crumbs: NavBreadcrumbActionsCrumb[]
  pageTitle: string
  actions?: NavBreadcrumbActionsAction[]
}

export function NavBreadcrumbActions({
  crumbs,
  pageTitle,
  actions = [],
}: NavBreadcrumbActionsProps) {
  return (
    <header className="border-b border-border bg-surface-raised px-6 py-4">
      <nav
        aria-label="Breadcrumb"
        className="mb-2 flex items-center gap-1 text-xs text-muted-foreground"
      >
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-1">
            {c.href ? (
              <a href={c.href} className="hover:text-foreground">
                {c.label}
              </a>
            ) : (
              <span>{c.label}</span>
            )}
            {i < crumbs.length - 1 ? <span aria-hidden>/</span> : null}
          </span>
        ))}
      </nav>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">{pageTitle}</h1>
        <div className="flex gap-2">
          {actions.map((a, i) => (
            <a
              key={i}
              href={a.href}
              className={
                a.primary
                  ? 'rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground'
                  : 'rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-overlay'
              }
            >
              {a.label}
            </a>
          ))}
        </div>
      </div>
    </header>
  )
}
