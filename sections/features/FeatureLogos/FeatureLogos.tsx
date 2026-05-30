export type FeatureLogoItem = {
  iconUrl: string
  label: string
  description?: string
}

export type FeatureLogosProps = {
  heading?: string
  intro?: string
  items: FeatureLogoItem[]
}

export function FeatureLogos({ heading, intro, items }: FeatureLogosProps) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-4xl text-center">
        {heading ? (
          <h2 className="text-2xl font-bold text-foreground">{heading}</h2>
        ) : null}
        {intro ? (
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            {intro}
          </p>
        ) : null}
      </div>
      <ul className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((it, i) => (
          <li key={i} className="text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={it.iconUrl}
              alt=""
              className="mx-auto h-12 w-12 object-contain"
            />
            <p className="mt-3 text-sm font-semibold text-foreground">
              {it.label}
            </p>
            {it.description ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {it.description}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  )
}
