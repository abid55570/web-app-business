export type TweetWallTweet = {
  id: string
  authorHandle: string
  authorName: string
  authorAvatarUrl?: string
  body: string
  postedAt: string
  href: string
}

export type TweetWallProps = {
  heading?: string
  tweets: TweetWallTweet[]
}

export function TweetWall({ heading, tweets }: TweetWallProps) {
  return (
    <section className="px-6 py-16">
      {heading ? (
        <h2 className="mx-auto mb-10 max-w-5xl text-center text-2xl font-bold text-foreground">
          {heading}
        </h2>
      ) : null}
      <ul className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tweets.map((t) => (
          <li key={t.id}>
            <a
              href={t.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl border border-border bg-surface-raised p-4 hover:border-primary"
            >
              <header className="flex items-center gap-3">
                {t.authorAvatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={t.authorAvatarUrl}
                    alt=""
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="grid h-9 w-9 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
                  >
                    {t.authorName.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {t.authorName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    @{t.authorHandle}
                  </p>
                </div>
                <span aria-hidden className="text-base font-bold text-foreground">
                  𝕏
                </span>
              </header>
              <p className="mt-3 text-sm leading-relaxed text-foreground">
                {t.body}
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                {t.postedAt}
              </p>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
