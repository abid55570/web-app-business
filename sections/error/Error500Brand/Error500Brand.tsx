export type Error500BrandProps = {
  brand?: string
  heading?: string
  body?: string
  statusUrl?: string
  homeUrl?: string
}

export function Error500Brand({
  brand,
  heading = 'Something went sideways',
  body = 'Our service is having a moment. We have already been notified and are on it.',
  statusUrl,
  homeUrl = '/',
}: Error500BrandProps) {
  return (
    <section className="grid min-h-[60vh] place-items-center px-6 py-16">
      <div className="text-center">
        {brand ? (
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">
            {brand}
          </p>
        ) : null}
        <p className="mb-2 text-[8rem] font-black leading-none text-primary opacity-15">
          500
        </p>
        <h1 className="mb-3 text-3xl font-bold text-foreground">{heading}</h1>
        <p className="mx-auto mb-8 max-w-md text-base text-muted-foreground">
          {body}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href={homeUrl}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Back to home
          </a>
          {statusUrl ? (
            <a
              href={statusUrl}
              className="rounded-lg border border-border px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-overlay"
            >
              View status page
            </a>
          ) : null}
        </div>
      </div>
    </section>
  )
}
