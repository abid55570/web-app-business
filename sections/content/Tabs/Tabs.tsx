export type ContentTab = {
  id: string
  label: string
  body: React.ReactNode
}

export type TabsProps = {
  tabs: ContentTab[]
  groupId: string
}

export function Tabs({ tabs, groupId }: TabsProps) {
  return (
    <section>
      {tabs.map((t, i) => (
        <input
          key={`r-${i}`}
          type="radio"
          id={`${groupId}-${t.id}`}
          name={groupId}
          defaultChecked={i === 0}
          className="peer/t sr-only"
        />
      ))}
      <div role="tablist" className="flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <label
            key={t.id}
            htmlFor={`${groupId}-${t.id}`}
            role="tab"
            className="cursor-pointer border-b-2 border-transparent px-4 py-2 -mb-px text-sm font-semibold text-muted-foreground hover:text-foreground peer-checked/t:border-primary peer-checked/t:text-foreground"
          >
            {t.label}
          </label>
        ))}
      </div>
      <div className="py-5">
        {tabs.map((t) => (
          <div key={t.id} className="hidden peer-checked/t:block">
            {t.body}
          </div>
        ))}
      </div>
    </section>
  )
}
