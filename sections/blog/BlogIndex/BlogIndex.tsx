export type BlogIndexPost = {
  title: string
  excerpt: string
  coverUrl?: string
  href: string
  author: string
  publishedAt: string
  readMinutes?: number
}

export type BlogIndexProps = {
  heading?: string
  posts: BlogIndexPost[]
}

export function BlogIndex({ heading = 'From the blog', posts }: BlogIndexProps) {
  return (
    <section className="px-6 py-16 lg:px-12 lg:py-24">
      <h2 className="mb-12 text-center text-3xl font-bold text-foreground lg:text-4xl">
        {heading}
      </h2>
      <ul className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((p, i) => (
          <li key={i}>
            <a
              href={p.href}
              className="block overflow-hidden rounded-lg border border-border bg-surface-raised transition-shadow hover:shadow-lg"
            >
              {p.coverUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={p.coverUrl}
                  alt=""
                  loading="lazy"
                  className="h-44 w-full object-cover"
                />
              ) : null}
              <div className="p-5">
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {p.title}
                </h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  {p.excerpt}
                </p>
                <p className="text-xs text-muted-foreground">
                  {p.author} · {p.publishedAt}
                  {p.readMinutes ? ` · ${p.readMinutes} min read` : null}
                </p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
