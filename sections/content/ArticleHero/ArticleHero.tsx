/**
 * ArticleHero — large cover, centered title, byline meta strip.
 * Pure presentational; pages pass values from the route loader.
 */
export type ArticleHeroProps = {
  title: string
  subtitle?: string
  coverUrl?: string
  author?: string
  authorAvatarUrl?: string
  publishedAt?: string
  readMinutes?: number
}

export function ArticleHero({
  title,
  subtitle,
  coverUrl,
  author,
  authorAvatarUrl,
  publishedAt,
  readMinutes,
}: ArticleHeroProps) {
  return (
    <header className="px-6 pt-16 pb-12 lg:px-12 lg:pt-24 lg:pb-16">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="mb-4 text-4xl font-bold leading-tight text-foreground lg:text-5xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mb-8 text-lg text-muted-foreground">{subtitle}</p>
        ) : null}
        {author || publishedAt || readMinutes ? (
          <div className="mb-10 flex items-center justify-center gap-3 text-sm text-muted-foreground">
            {authorAvatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={authorAvatarUrl}
                alt=""
                className="h-8 w-8 rounded-full object-cover"
                loading="lazy"
              />
            ) : null}
            {author ? <span>{author}</span> : null}
            {publishedAt ? <span>· {publishedAt}</span> : null}
            {readMinutes ? <span>· {readMinutes} min read</span> : null}
          </div>
        ) : null}
      </div>
      {coverUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={coverUrl}
          alt=""
          className="mx-auto max-h-[480px] w-full max-w-5xl rounded-lg object-cover"
          loading="lazy"
        />
      ) : null}
    </header>
  )
}
