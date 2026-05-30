export type BlogIndexHeroFeatured = {
  title: string
  href: string
  excerpt: string
  imageUrl?: string
  author: string
  readingTimeMinutes: number
  publishedAt: string
}

export type BlogIndexHeroProps = {
  eyebrow?: string
  blogTitle: string
  description?: string
  featured: BlogIndexHeroFeatured
}

export function BlogIndexHero({
  eyebrow,
  blogTitle,
  description,
  featured,
}: BlogIndexHeroProps) {
  return (
    <section className="px-6 py-16 lg:py-20">
      <div className="mx-auto max-w-5xl">
        {eyebrow ? (
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-4xl font-bold text-foreground lg:text-5xl">
          {blogTitle}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-base text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      <article className="mx-auto mt-12 grid max-w-5xl items-center gap-8 lg:grid-cols-[3fr_2fr]">
        {featured.imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={featured.imageUrl}
            alt=""
            className="aspect-[16/10] w-full rounded-xl object-cover shadow-md"
          />
        ) : null}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Featured
          </p>
          <h2 className="mt-2 text-2xl font-bold leading-tight text-foreground lg:text-3xl">
            <a href={featured.href} className="hover:underline">
              {featured.title}
            </a>
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            {featured.excerpt}
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            {featured.author} · {featured.publishedAt} ·{' '}
            {featured.readingTimeMinutes} min read
          </p>
        </div>
      </article>
    </section>
  )
}
