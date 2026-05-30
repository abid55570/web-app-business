export type HeroTabsPreviewTab = {
  id: string
  label: string
  imageUrl: string
}

export type HeroTabsPreviewProps = {
  heading: string
  subheading?: string
  tabs: HeroTabsPreviewTab[]
}

export function HeroTabsPreview({
  heading,
  subheading,
  tabs,
}: HeroTabsPreviewProps) {
  return (
    <section className="px-6 py-16 text-center">
      <h1 className="mx-auto mb-4 max-w-3xl text-4xl font-bold text-foreground sm:text-5xl">
        {heading}
      </h1>
      {subheading ? (
        <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
          {subheading}
        </p>
      ) : null}
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 inline-flex rounded-full border border-border bg-surface-raised p-1">
          {tabs.map((t, i) => (
            <div key={t.id} className="flex">
              <input
                type="radio"
                id={`herotabs-${t.id}`}
                name="herotabs"
                className="peer/t hidden"
                defaultChecked={i === 0}
              />
              <label
                htmlFor={`herotabs-${t.id}`}
                className="cursor-pointer rounded-full px-4 py-1.5 text-sm peer-checked/t:bg-primary peer-checked/t:text-primary-foreground"
              >
                {t.label}
              </label>
            </div>
          ))}
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-surface-raised shadow-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={tabs[0]?.imageUrl} alt="" className="w-full" />
        </div>
      </div>
    </section>
  )
}
