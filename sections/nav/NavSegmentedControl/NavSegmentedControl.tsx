export type NavSegmentedControlSegment = {
  id: string
  label: string
}

export type NavSegmentedControlProps = {
  segments: NavSegmentedControlSegment[]
  defaultSegmentId?: string
  ariaLabel?: string
}

export function NavSegmentedControl({
  segments,
  defaultSegmentId,
  ariaLabel = 'View',
}: NavSegmentedControlProps) {
  const fallback = defaultSegmentId ?? segments[0]?.id
  return (
    <nav className="px-6 py-4" aria-label={ariaLabel}>
      <div className="mx-auto max-w-md">
        <div className="inline-flex w-full divide-x divide-border overflow-hidden rounded-lg border border-border bg-surface-raised">
          {segments.map((s) => (
            <div key={s.id} className="flex flex-1">
              <input
                type="radio"
                id={`segctrl-${s.id}`}
                name="segctrl"
                className="peer hidden"
                defaultChecked={s.id === fallback}
              />
              <label
                htmlFor={`segctrl-${s.id}`}
                className="flex-1 cursor-pointer px-4 py-2 text-center text-sm font-medium text-muted-foreground peer-checked:bg-primary peer-checked:text-primary-foreground"
              >
                {s.label}
              </label>
            </div>
          ))}
        </div>
      </div>
    </nav>
  )
}
