export type FeatureTab = {
  id: string
  label: string
  title: string
  body: string
  imageUrl?: string
}

export type FeatureTabsProps = {
  heading?: string
  tabs: FeatureTab[]
  groupId: string
}

export function FeatureTabs({ heading, tabs, groupId }: FeatureTabsProps) {
  return (
    <section className="px-6 py-20">
      {heading ? (
        <h2 className="mx-auto mb-8 max-w-5xl text-3xl font-bold text-foreground">
          {heading}
        </h2>
      ) : null}
      <div className="mx-auto max-w-5xl">
        {tabs.map((t, i) => (
          <input
            key={`r-${i}`}
            type="radio"
            id={`${groupId}-${t.id}`}
            name={groupId}
            defaultChecked={i === 0}
            className="peer/tab sr-only"
          />
        ))}
        <div className="flex flex-wrap gap-2 border-b border-border">
          {tabs.map((t, i) => (
            <label
              key={i}
              htmlFor={`${groupId}-${t.id}`}
              className={`cursor-pointer rounded-t-md px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent peer-checked:bg-primary peer-checked:text-primary-foreground`}
            >
              {t.label}
            </label>
          ))}
        </div>
        <div className="mt-6 grid items-center gap-8 lg:grid-cols-2">
          {tabs.map((t, i) => (
            <div
              key={i}
              className="contents"
            >
              <div>
                <h3 className="text-2xl font-bold text-foreground">{t.title}</h3>
                <p className="mt-2 text-base text-muted-foreground">{t.body}</p>
              </div>
              {t.imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={t.imageUrl}
                  alt=""
                  className="rounded-lg object-cover shadow-md"
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
