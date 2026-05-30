export type BlogPostTag = {
  label: string
  href: string
}

export type BlogPostHeaderProps = {
  category?: string
  title: string
  subtitle?: string
  author: string
  authorAvatarUrl?: string
  publishedAt: string
  readingTimeMinutes: number
  coverImageUrl?: string
  tags?: BlogPostTag[]
}

export function BlogPostHeader({
  category,
  title,
  subtitle,
  author,
  authorAvatarUrl,
  publishedAt,
  readingTimeMinutes,
  coverImageUrl,
  tags,
}: BlogPostHeaderProps) {
  return (
    <header className="mx-auto max-w-3xl px-6 pt-12 pb-8">
      {category ? (
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          {category}
        </p>
      ) : null}
      <h1 className="mt-3 text-4xl font-bold leading-tight text-foreground lg:text-5xl">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-3 text-xl text-muted-foreground">{subtitle}</p>
      ) : null}
      <div className="mt-6 flex items-center gap-3 text-sm">
        {authorAvatarUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={authorAvatarUrl}
            alt=""
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : null}
        <span className="font-semibold text-foreground">{author}</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">{publishedAt}</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">
          {readingTimeMinutes} min read
        </span>
      </div>
      {tags?.length ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {tags.map((t, i) => (
            <li key={i}>
              <a
                href={t.href}
                className="rounded-full bg-surface-sunken px-2.5 py-0.5 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                #{t.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
      {coverImageUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={coverImageUrl}
          alt=""
          className="mt-8 aspect-[16/9] w-full rounded-xl object-cover"
        />
      ) : null}
    </header>
  )
}
