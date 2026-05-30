export type DownloadAppStoreCardProps = {
  appName: string
  tagline?: string
  rating?: number
  ratingCount?: number
  iconUrl?: string
  appStoreUrl?: string
  playStoreUrl?: string
}

export function DownloadAppStoreCard({
  appName,
  tagline,
  rating,
  ratingCount,
  iconUrl,
  appStoreUrl,
  playStoreUrl,
}: DownloadAppStoreCardProps) {
  const stars = rating !== undefined ? Math.round(rating) : null
  return (
    <section className="px-6 py-12">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-2xl border border-border bg-surface-raised p-8 sm:flex-row sm:text-left">
        {iconUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={iconUrl}
            alt=""
            className="h-24 w-24 flex-shrink-0 rounded-2xl object-cover shadow-lg"
          />
        ) : (
          <span className="grid h-24 w-24 flex-shrink-0 place-items-center rounded-2xl bg-primary text-3xl font-black text-primary-foreground shadow-lg">
            {appName.charAt(0)}
          </span>
        )}
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-xl font-bold text-foreground">{appName}</h3>
          {tagline ? (
            <p className="text-sm text-muted-foreground">{tagline}</p>
          ) : null}
          {stars !== null ? (
            <p className="mt-1 text-sm">
              <span className="text-warning-fg">
                {'★'.repeat(stars)}
                <span className="text-muted-foreground">
                  {'★'.repeat(5 - stars)}
                </span>
              </span>
              <span className="ml-2 text-xs text-muted-foreground">
                {rating}/5{ratingCount ? ` · ${ratingCount} reviews` : ''}
              </span>
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
            {appStoreUrl ? (
              <a
                href={appStoreUrl}
                className="rounded-lg bg-foreground px-4 py-2 text-xs font-bold text-surface-base"
              >
                App Store
              </a>
            ) : null}
            {playStoreUrl ? (
              <a
                href={playStoreUrl}
                className="rounded-lg bg-foreground px-4 py-2 text-xs font-bold text-surface-base"
              >
                Google Play
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
