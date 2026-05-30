export type DownloadCtaProps = {
  heading?: string
  body?: string
  iosHref?: string
  androidHref?: string
}

export function DownloadCta({
  heading = 'Get the app',
  body,
  iosHref,
  androidHref,
}: DownloadCtaProps) {
  return (
    <section className="px-6 py-16 text-center lg:py-20">
      <h2 className="mb-4 text-3xl font-bold text-foreground lg:text-4xl">
        {heading}
      </h2>
      {body ? (
        <p className="mx-auto mb-8 max-w-xl text-base text-muted-foreground">
          {body}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-center gap-4">
        {iosHref ? (
          <a
            href={iosHref}
            className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-black/90"
          >
            <span className="text-xl" aria-hidden="true">
              ⌘
            </span>
            App Store
          </a>
        ) : null}
        {androidHref ? (
          <a
            href={androidHref}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700/90"
          >
            <span className="text-xl" aria-hidden="true">
              ▶
            </span>
            Google Play
          </a>
        ) : null}
      </div>
    </section>
  )
}
