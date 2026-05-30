export type AppDownloadProps = {
  headline: string
  body?: string
  appStoreUrl?: string
  playStoreUrl?: string
  webAppUrl?: string
  qrImageUrl?: string
}

export function AppDownload({
  headline,
  body,
  appStoreUrl,
  playStoreUrl,
  webAppUrl,
  qrImageUrl,
}: AppDownloadProps) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto grid max-w-4xl items-center gap-10 sm:grid-cols-[2fr_1fr]">
        <div>
          <h2 className="text-2xl font-bold text-foreground lg:text-3xl">
            {headline}
          </h2>
          {body ? (
            <p className="mt-2 text-base text-muted-foreground">{body}</p>
          ) : null}
          <ul className="mt-5 flex flex-wrap gap-3">
            {appStoreUrl ? (
              <li>
                <a
                  href={appStoreUrl}
                  className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90"
                >
                  <span aria-hidden></span> App Store
                </a>
              </li>
            ) : null}
            {playStoreUrl ? (
              <li>
                <a
                  href={playStoreUrl}
                  className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90"
                >
                  <span aria-hidden>▶</span> Google Play
                </a>
              </li>
            ) : null}
            {webAppUrl ? (
              <li>
                <a
                  href={webAppUrl}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-raised px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
                >
                  <span aria-hidden>⌘</span> Web app
                </a>
              </li>
            ) : null}
          </ul>
        </div>
        {qrImageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={qrImageUrl}
            alt="Scan to install"
            className="mx-auto h-32 w-32 rounded-md border border-border bg-white p-2"
          />
        ) : null}
      </div>
    </section>
  )
}
