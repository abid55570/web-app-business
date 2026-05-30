export type CtaWithImageProps = {
  headline: string
  body?: string
  ctaLabel?: string
  ctaHref?: string
  imageUrl: string
  imagePosition?: 'left' | 'right'
}

export function CtaWithImage({
  headline,
  body,
  ctaLabel = 'Get started',
  ctaHref = '/signup',
  imageUrl,
  imagePosition = 'right',
}: CtaWithImageProps) {
  const imageFirst = imagePosition === 'left'
  return (
    <section className="bg-surface-raised px-6 py-16 lg:px-12 lg:py-24">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className={imageFirst ? 'lg:order-2' : ''}>
          <h2 className="mb-4 text-3xl font-bold text-foreground lg:text-4xl">
            {headline}
          </h2>
          {body ? (
            <p className="mb-8 max-w-prose text-base text-muted-foreground">
              {body}
            </p>
          ) : null}
          <a
            href={ctaHref}
            className="inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            {ctaLabel}
          </a>
        </div>
        <div className={imageFirst ? 'lg:order-1' : ''}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            className="w-full rounded-lg object-cover shadow"
          />
        </div>
      </div>
    </section>
  )
}
