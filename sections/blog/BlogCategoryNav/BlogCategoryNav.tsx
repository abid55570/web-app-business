export type BlogCategory = {
  label: string
  href: string
  count?: number
  active?: boolean
}

export type BlogCategoryNavProps = {
  categories: BlogCategory[]
}

export function BlogCategoryNav({ categories }: BlogCategoryNavProps) {
  return (
    <nav aria-label="Blog categories" className="border-b border-border">
      <ul className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-6 py-2 [scrollbar-width:none]">
        {categories.map((c, i) => (
          <li key={i}>
            <a
              href={c.href}
              aria-current={c.active ? 'page' : undefined}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ${
                c.active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              {c.label}
              {c.count !== undefined ? (
                <span className="text-xs opacity-70">{c.count}</span>
              ) : null}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
