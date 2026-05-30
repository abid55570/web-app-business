export type WallOfLoveCompactTweet = {
  authorName: string
  authorHandle: string
  avatarUrl?: string
  body: string
}

export type WallOfLoveCompactProps = {
  heading?: string
  tweets: WallOfLoveCompactTweet[]
}

export function WallOfLoveCompact({
  heading,
  tweets,
}: WallOfLoveCompactProps) {
  return (
    <section className="px-6 py-12">
      {heading ? (
        <h2 className="mx-auto mb-6 max-w-5xl text-center text-xl font-semibold text-foreground">
          {heading}
        </h2>
      ) : null}
      <ul className="mx-auto grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tweets.map((t, i) => (
          <li
            key={i}
            className="rounded-lg border border-border bg-surface-raised p-3 text-xs"
          >
            <div className="flex items-center gap-2">
              {t.avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={t.avatarUrl}
                  alt=""
                  className="h-7 w-7 rounded-full object-cover"
                />
              ) : (
                <span
                  aria-hidden
                  className="grid h-7 w-7 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
                >
                  {t.authorName.charAt(0).toUpperCase()}
                </span>
              )}
              <div>
                <p className="font-semibold text-foreground">{t.authorName}</p>
                <p className="text-[10px] text-muted-foreground">
                  @{t.authorHandle}
                </p>
              </div>
            </div>
            <p className="mt-2 leading-relaxed text-foreground">{t.body}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
