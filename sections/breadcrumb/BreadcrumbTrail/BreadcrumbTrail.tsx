/**
 * BreadcrumbTrail — semantic <nav aria-label="Breadcrumb"> with ordered list.
 * Last crumb gets aria-current="page" + no link.
 */
export type Crumb = {
  label: string
  href?: string
}

export type BreadcrumbTrailProps = {
  crumbs: Crumb[]
}

export function BreadcrumbTrail({ crumbs }: BreadcrumbTrailProps) {
  return (
    <nav aria-label="Breadcrumb" className="px-6 py-4 lg:px-12">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1
          return (
            <li key={i} className="flex items-center gap-2">
              {c.href && !isLast ? (
                <a href={c.href} className="hover:text-primary">
                  {c.label}
                </a>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={isLast ? 'font-semibold text-foreground' : ''}
                >
                  {c.label}
                </span>
              )}
              {!isLast ? (
                <span aria-hidden="true" className="text-border">
                  ›
                </span>
              ) : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
