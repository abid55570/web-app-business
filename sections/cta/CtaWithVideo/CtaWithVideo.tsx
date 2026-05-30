export type CtaWithVideoProps = {
  heading: string
  body?: string
  videoEmbedUrl: string
  videoTitle?: string
  primaryCtaLabel: string
  primaryCtaHref?: string
}

export function CtaWithVideo({
  heading,
  body,
  videoEmbedUrl,
  videoTitle = 'Demo video',
  primaryCtaLabel,
  primaryCtaHref = '#',
}: CtaWithVideoProps) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
        <div className="aspect-video overflow-hidden rounded-2xl border border-border bg-black">
          <iframe
            src={videoEmbedUrl}
            title={videoTitle}
            allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
        <div>
          <h2 className="mb-4 text-3xl font-bold text-foreground lg:text-4xl">
            {heading}
          </h2>
          {body ? (
            <p className="mb-6 text-base text-muted-foreground">{body}</p>
          ) : null}
          <a
            href={primaryCtaHref}
            className="inline-block rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            {primaryCtaLabel}
          </a>
        </div>
      </div>
    </section>
  )
}
