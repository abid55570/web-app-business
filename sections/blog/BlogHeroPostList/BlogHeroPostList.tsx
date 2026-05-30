export type BlogHeroPost = {
  title: string
  href: string
  excerpt?: string
  imageUrl?: string
  author: string
  publishedAt: string
}

export type BlogHeroPostListProps = {
  featured: BlogHeroPost
  recent: BlogHeroPost[]
}

export function BlogHeroPostList({
  featured,
  recent,
}: BlogHeroPostListProps) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.4fr_1fr]">
        <article>
          <a href={featured.href} className="group block">
            {featured.imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={featured.imageUrl}
                alt=""
                className="aspect-[16/10] w-full rounded-2xl object-cover transition-transform group-hover:scale-[1.01]"
              />
            ) : null}
            <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-primary">
              Featured
            </p>
            <h2 className="mt-2 text-2xl font-bold leading-tight text-foreground group-hover:underline lg:text-3xl">
              {featured.title}
            </h2>
            {featured.excerpt ? (
              <p className="mt-2 text-base text-muted-foreground">
                {featured.excerpt}
              </p>
            ) : null}
            <p className="mt-3 text-xs text-muted-foreground">
              {featured.author} · {featured.publishedAt}
            </p>
          </a>
        </article>
        <aside>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Latest
          </p>
          <ul className="mt-3 divide-y divide-border border-y border-border">
            {recent.map((p, i) => (
              <li key={i} className="py-4">
                <a href={p.href} className="group block">
                  <p className="font-semibold text-foreground group-hover:underline">
                    {p.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {p.author} · {p.publishedAt}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  )
}
