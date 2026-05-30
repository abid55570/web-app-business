export type BlogAuthorBylineProps = {
  authorName: string
  authorAvatarUrl?: string
  authorBio?: string
  publishedAt: string
  readMins: number
  socialLinks?: { label: string; href: string }[]
}

export function BlogAuthorByline({
  authorName,
  authorAvatarUrl,
  authorBio,
  publishedAt,
  readMins,
  socialLinks = [],
}: BlogAuthorBylineProps) {
  return (
    <section className="border-y border-border px-6 py-6">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-4">
        {authorAvatarUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={authorAvatarUrl}
            alt=""
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <span className="grid h-12 w-12 place-items-center rounded-full bg-primary text-base font-bold text-primary-foreground">
            {authorName.charAt(0)}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{authorName}</p>
          {authorBio ? (
            <p className="text-xs text-muted-foreground">{authorBio}</p>
          ) : null}
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <p>{publishedAt}</p>
          <p>{readMins} min read</p>
        </div>
        {socialLinks.length ? (
          <ul className="flex w-full justify-end gap-2 border-t border-border pt-3">
            {socialLinks.map((s, i) => (
              <li key={i}>
                <a
                  href={s.href}
                  className="rounded border border-border px-2 py-0.5 text-[10px] font-medium text-foreground hover:bg-surface-overlay"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  )
}
