export type ChecklistContentItem = {
  label: string
  defaultChecked?: boolean
}

export type ChecklistContentProps = {
  heading?: string
  items: ChecklistContentItem[]
}

export function ChecklistContent({
  heading,
  items,
}: ChecklistContentProps) {
  return (
    <section className="my-6 rounded-xl border border-border bg-surface-raised p-5">
      {heading ? (
        <p className="mb-3 font-semibold text-foreground">{heading}</p>
      ) : null}
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={i}>
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input
                type="checkbox"
                defaultChecked={it.defaultChecked}
                className="peer/c mt-1 h-4 w-4 rounded border-border accent-primary"
              />
              <span className="text-foreground peer-checked/c:text-muted-foreground peer-checked/c:line-through">
                {it.label}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  )
}
