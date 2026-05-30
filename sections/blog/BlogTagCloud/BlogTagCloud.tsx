export type BlogTagCloudTag = {
  label: string
  href: string
  count: number
}

export type BlogTagCloudProps = {
  heading?: string
  tags: BlogTagCloudTag[]
}

export function BlogTagCloud({ heading, tags }: BlogTagCloudProps) {
  const maxCount = Math.max(...tags.map((t) => t.count), 1)
  return (
    <section className="mx-auto max-w-3xl px-6 py-10">
      {heading ? (
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          {heading}
        </h2>
      ) : null}
      <ul className="flex flex-wrap items-center gap-2">
        {tags.map((t, i) => {
          const ratio = t.count / maxCount
          const size = 0.75 + ratio * 0.75 // 0.75rem → 1.5rem
          return (
            <li key={i}>
              <a
                href={t.href}
                style={{ fontSize: `${size}rem` }}
                className="inline-flex items-baseline gap-1 rounded-full bg-surface-sunken px-3 py-1 font-medium text-foreground hover:bg-primary hover:text-primary-foreground"
              >
                {t.label}
                <span className="text-xs opacity-60">{t.count}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
