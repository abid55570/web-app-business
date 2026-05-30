export type RelatedPost = {
  title: string
  href: string
  excerpt?: string
  imageUrl?: string
  readingTimeMinutes?: number
}

export type BlogRelatedPostsProps = {
  heading?: string
  posts: RelatedPost[]
}

export function BlogRelatedPosts({
  heading = 'Keep reading',
  posts,
}: BlogRelatedPostsProps) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <h2 className="mb-6 text-xl font-semibold text-foreground">{heading}</h2>
      <ul className="grid gap-6 sm:grid-cols-3">
        {posts.map((p, i) => (
          <li key={i}>
            <a href={p.href} className="group block">
              {p.imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={p.imageUrl}
                  alt=""
                  className="aspect-[4/3] w-full rounded-lg object-cover"
                />
              ) : null}
              <p className="mt-3 font-semibold text-foreground group-hover:underline">
                {p.title}
              </p>
              {p.excerpt ? (
                <p className="mt-1 text-sm text-muted-foreground">{p.excerpt}</p>
              ) : null}
              {p.readingTimeMinutes ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  {p.readingTimeMinutes} min read
                </p>
              ) : null}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
