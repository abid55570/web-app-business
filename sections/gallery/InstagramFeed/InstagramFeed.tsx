export type InstagramPost = {
  imageUrl: string
  href: string
  likes?: number
  alt?: string
}

export type InstagramFeedProps = {
  handle?: string
  posts: InstagramPost[]
}

export function InstagramFeed({ handle, posts }: InstagramFeedProps) {
  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-5xl">
        {handle ? (
          <p className="mb-5 text-center text-sm font-semibold text-muted-foreground">
            Follow on Instagram{' '}
            <span className="text-foreground">@{handle}</span>
          </p>
        ) : null}
        <ul className="grid grid-cols-3 gap-1 sm:gap-2 lg:grid-cols-6">
          {posts.map((p, i) => (
            <li key={i}>
              <a
                href={p.href}
                className="group relative block overflow-hidden"
                target="_blank"
                rel="noopener noreferrer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.imageUrl}
                  alt={p.alt ?? ''}
                  className="aspect-square w-full object-cover transition-transform group-hover:scale-110"
                />
                <span className="absolute inset-0 grid place-items-center bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="text-sm font-semibold">
                    ♥ {p.likes ?? '—'}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
