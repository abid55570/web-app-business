export type LocationMapProps = {
  embedUrl: string
  caption?: string
  directionsHref?: string
}

export function LocationMap({
  embedUrl,
  caption,
  directionsHref,
}: LocationMapProps) {
  return (
    <section className="px-6 py-10 lg:px-12">
      <figure className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-xl border border-border">
          <iframe
            src={embedUrl}
            title={caption ?? 'Location map'}
            loading="lazy"
            className="aspect-[16/9] w-full"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        {(caption || directionsHref) ? (
          <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
            {caption ? (
              <span className="text-muted-foreground">{caption}</span>
            ) : (
              <span />
            )}
            {directionsHref ? (
              <a
                href={directionsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary hover:underline"
              >
                Get directions →
              </a>
            ) : null}
          </figcaption>
        ) : null}
      </figure>
    </section>
  )
}
