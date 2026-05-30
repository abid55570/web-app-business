export type FeaturesPullTab = { id: string; label: string; description: string }
export type FeaturesPullTabsProps = { heading?: string; tabs: FeaturesPullTab[] }
export function FeaturesPullTabs({ heading, tabs }: FeaturesPullTabsProps) {
  return (
    <section className="px-6 py-16">
      {heading ? <h2 className="mx-auto mb-8 max-w-3xl text-center text-3xl font-bold text-foreground">{heading}</h2> : null}
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t, i) => (
            <div key={t.id} className="flex">
              <input type="radio" id={`fpt-${t.id}`} name="fpt" className="peer hidden" defaultChecked={i === 0} />
              <label htmlFor={`fpt-${t.id}`} className="cursor-pointer rounded-lg border border-border bg-surface-raised px-4 py-2 text-sm font-medium text-foreground peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground">{t.label}</label>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-xl border border-border bg-surface-raised p-6 text-foreground">
          {tabs[0]?.description}
        </div>
      </div>
    </section>
  )
}
