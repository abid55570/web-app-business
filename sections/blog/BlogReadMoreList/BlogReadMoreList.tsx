export type BlogReadMoreListPost = {
  title: string
  excerpt: string
  href: string
}

export type BlogReadMoreListProps = {
  heading?: string
  posts: BlogReadMoreListPost[]
}

export function BlogReadMoreList({
  heading = 'Keep reading',
  posts,
}: BlogReadMoreListProps) {
  return (
    <section className="border-t border-border bg-surface-overlay px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {heading}
        </h3>
        <ul className="space-y-4">
          {posts.map((p, i) => (
            <li key={i}>
              <a href={p.href} className="group block">
                <h4 className="mb-1 text-base font-semibold text-foreground group-hover:text-primary">
                  {p.title} →
                </h4>
                <p className="text-sm text-muted-foreground">{p.excerpt}</p>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
