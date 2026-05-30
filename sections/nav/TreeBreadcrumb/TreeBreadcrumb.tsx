export type TreeBreadcrumbNode = {
  label: string
  href?: string
  current?: boolean
}

export type TreeBreadcrumbProps = {
  path: TreeBreadcrumbNode[]
}

export function TreeBreadcrumb({ path }: TreeBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {path.map((n, i) => {
          const isLast = i === path.length - 1
          return (
            <li key={i} className="flex items-center gap-1.5">
              {n.href && !n.current ? (
                <a
                  href={n.href}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {n.label}
                </a>
              ) : (
                <span
                  aria-current={n.current || isLast ? 'page' : undefined}
                  className="font-medium text-foreground"
                >
                  {n.label}
                </span>
              )}
              {!isLast ? (
                <span aria-hidden className="text-muted-foreground/60">
                  /
                </span>
              ) : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
