export type BlogCategoryHeaderProps = {
  category: string
  description?: string
  postCount: number
  siblingCategories?: { label: string; href: string; active?: boolean }[]
}

export function BlogCategoryHeader({
  category,
  description,
  postCount,
  siblingCategories = [],
}: BlogCategoryHeaderProps) {
  return (
    <section className="border-b border-border bg-surface-raised px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
          Category
        </p>
        <h1 className="mb-2 text-4xl font-bold text-foreground">{category}</h1>
        {description ? (
          <p className="mb-4 max-w-2xl text-base text-muted-foreground">
            {description}
          </p>
        ) : null}
        <p className="mb-6 text-xs text-muted-foreground">
          {postCount} {postCount === 1 ? 'post' : 'posts'}
        </p>
        {siblingCategories.length ? (
          <div className="flex flex-wrap gap-2">
            {siblingCategories.map((c, i) => (
              <a
                key={i}
                href={c.href}
                className={
                  c.active
                    ? 'rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground'
                    : 'rounded-full border border-border bg-surface-base px-3 py-1 text-xs font-medium text-foreground hover:bg-surface-overlay'
                }
              >
                {c.label}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
