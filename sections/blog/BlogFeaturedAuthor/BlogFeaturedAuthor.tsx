export type BlogFeaturedAuthorPost = {
  title: string
  href: string
  publishedAt: string
}

export type BlogFeaturedAuthorProps = {
  name: string
  role: string
  bio: string
  avatarUrl?: string
  posts: BlogFeaturedAuthorPost[]
  profileHref: string
}

export function BlogFeaturedAuthor({
  name,
  role,
  bio,
  avatarUrl,
  posts,
  profileHref,
}: BlogFeaturedAuthorProps) {
  return (
    <article className="mx-auto grid max-w-4xl gap-8 rounded-2xl border border-border bg-surface-raised p-6 sm:grid-cols-[200px_1fr]">
      <div className="text-center sm:text-left">
        {avatarUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={avatarUrl}
            alt=""
            className="mx-auto h-32 w-32 rounded-full object-cover sm:mx-0"
          />
        ) : (
          <span
            aria-hidden
            className="mx-auto grid h-32 w-32 place-items-center rounded-full bg-primary text-4xl font-bold text-primary-foreground sm:mx-0"
          >
            {name.charAt(0).toUpperCase()}
          </span>
        )}
        <p className="mt-3 text-base font-bold text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground">{role}</p>
        <a
          href={profileHref}
          className="mt-3 inline-block text-xs font-semibold text-primary hover:underline"
        >
          View profile →
        </a>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{bio}</p>
        <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Recent
        </p>
        <ul className="mt-2 divide-y divide-border">
          {posts.map((p, i) => (
            <li key={i} className="py-2">
              <a
                href={p.href}
                className="block font-medium text-foreground hover:underline"
              >
                {p.title}
              </a>
              <p className="text-xs text-muted-foreground">{p.publishedAt}</p>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}
