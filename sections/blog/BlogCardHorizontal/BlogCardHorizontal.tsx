export type BlogCardHorizontalProps = {
  category?: string
  title: string
  excerpt: string
  href: string
  imageUrl?: string
  author: string
  publishedAt: string
  readingTimeMinutes: number
}

export function BlogCardHorizontal({
  category,
  title,
  excerpt,
  href,
  imageUrl,
  author,
  publishedAt,
  readingTimeMinutes,
}: BlogCardHorizontalProps) {
  return (
    <article className="grid items-center gap-6 rounded-xl border border-border bg-surface-raised p-5 sm:grid-cols-[200px_1fr]">
      {imageUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={imageUrl}
          alt=""
          className="aspect-[4/3] w-full rounded-lg object-cover"
        />
      ) : null}
      <div>
        {category ? (
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            {category}
          </p>
        ) : null}
        <h3 className="mt-1 text-xl font-bold text-foreground">
          <a href={href} className="hover:underline">
            {title}
          </a>
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">{excerpt}</p>
        <p className="mt-3 text-xs text-muted-foreground">
          {author} · {publishedAt} · {readingTimeMinutes} min read
        </p>
      </div>
    </article>
  )
}
