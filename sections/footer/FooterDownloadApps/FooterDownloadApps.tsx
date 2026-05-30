export type FooterDownloadAppsProps = {
  brand: string
  tagline?: string
  appStoreHref?: string
  playStoreHref?: string
  webHref?: string
  copyright?: string
}

export function FooterDownloadApps({
  brand,
  tagline,
  appStoreHref,
  playStoreHref,
  webHref,
  copyright,
}: FooterDownloadAppsProps) {
  return (
    <footer className="border-t border-border bg-surface-overlay px-6 py-10">
      <div className="mx-auto grid max-w-5xl items-center gap-6 lg:grid-cols-[2fr_1fr]">
        <div>
          <p className="mb-1 text-2xl font-black text-foreground">{brand}</p>
          {tagline ? (
            <p className="text-sm text-muted-foreground">{tagline}</p>
          ) : null}
        </div>
        <ul className="flex flex-wrap justify-end gap-2">
          {appStoreHref ? (
            <li>
              <a
                href={appStoreHref}
                className="rounded-lg bg-foreground px-4 py-2 text-xs font-bold text-surface-base"
              >
                ⬇ App Store
              </a>
            </li>
          ) : null}
          {playStoreHref ? (
            <li>
              <a
                href={playStoreHref}
                className="rounded-lg bg-foreground px-4 py-2 text-xs font-bold text-surface-base"
              >
                ⬇ Google Play
              </a>
            </li>
          ) : null}
          {webHref ? (
            <li>
              <a
                href={webHref}
                className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-surface-raised"
              >
                Open web app
              </a>
            </li>
          ) : null}
        </ul>
      </div>
      {copyright ? (
        <p className="mt-6 text-center text-xs text-muted-foreground">
          {copyright}
        </p>
      ) : null}
    </footer>
  )
}
