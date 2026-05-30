export type BlogHeroFeaturedProps = {
  category?: string
  title: string
  excerpt: string
  authorName: string
  date: string
  readMins: number
  imageUrl: string
  href: string
}

export function BlogHeroFeatured({
  category,
  title,
  excerpt,
  authorName,
  date,
  readMins,
  imageUrl,
  href,
}: BlogHeroFeaturedProps) {
  return (
    <section className="px-6 py-12">
      <article className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2 lg:items-center">
        <a href={href} className="block overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="" className="aspect-video w-full object-cover" />
        </a>
        <div>
          {category ? (
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
              {category}
            </p>
          ) : null}
          <h2 className="mb-3 text-3xl font-bold text-foreground lg:text-4xl">
            <a href={href} className="hover:text-primary">
              {title}
            </a>
          </h2>
          <p className="mb-4 text-base text-muted-foreground">{excerpt}</p>
          <p className="text-xs text-muted-foreground">
            {authorName} · {date} · {readMins} min read
          </p>
        </div>
      </article>
    </section>
  )
}
