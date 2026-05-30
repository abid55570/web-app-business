export type FeatureAlternatingItem = {
  title: string
  body: string
  imageUrl: string
  ctaLabel?: string
  ctaHref?: string
}

export type FeatureAlternatingProps = {
  items: FeatureAlternatingItem[]
}

export function FeatureAlternating({ items }: FeatureAlternatingProps) {
  return (
    <section className="px-6 py-20 lg:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-24">
        {items.map((item, i) => (
          <div
            key={i}
            className={`grid items-center gap-12 lg:grid-cols-2 ${
              i % 2 === 1 ? 'lg:[direction:rtl]' : ''
            }`}
          >
            <div className="lg:[direction:ltr]">
              <h3 className="mb-4 text-3xl font-bold text-foreground">
                {item.title}
              </h3>
              <p className="text-lg text-muted-foreground">{item.body}</p>
              {item.ctaLabel && item.ctaHref ? (
                <a
                  href={item.ctaHref}
                  className="mt-5 inline-flex items-center text-sm font-semibold text-primary hover:underline"
                >
                  {item.ctaLabel} →
                </a>
              ) : null}
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt=""
              className="rounded-xl object-cover shadow-xl lg:[direction:ltr]"
            />
          </div>
        ))}
      </div>
    </section>
  )
}
