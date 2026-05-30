export type BlogPostTeaserListPost = {
  title: string
  excerpt: string
  date: string
  readMins: number
  href: string
}

export type BlogPostTeaserListProps = {
  heading?: string
  posts: BlogPostTeaserListPost[]
}

export function BlogPostTeaserList({
  heading,
  posts,
}: BlogPostTeaserListProps) {
  return (
    <section className="px-6 py-12">
      {heading ? (
        <h2 className="mx-auto mb-6 max-w-3xl text-xl font-semibold text-foreground">
          {heading}
        </h2>
      ) : null}
      <ul className="mx-auto max-w-3xl divide-y divide-border">
        {posts.map((p, i) => (
          <li key={i} className="py-5">
            <a href={p.href} className="group block">
              <p className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span>{p.date}</span>
                <span aria-hidden>·</span>
                <span>{p.readMins} min read</span>
              </p>
              <h3 className="mb-1 text-lg font-semibold text-foreground group-hover:text-primary">
                {p.title}
              </h3>
              <p className="text-sm text-muted-foreground">{p.excerpt}</p>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
