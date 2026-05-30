export type SegmentedControlOption = {
  label: string
  value: string
}

export type SegmentedControlProps = {
  name: string
  options: SegmentedControlOption[]
  defaultValue?: string
}

export function SegmentedControl({
  name,
  options,
  defaultValue,
}: SegmentedControlProps) {
  return (
    <fieldset className="inline-flex rounded-full bg-surface-sunken p-1">
      <legend className="sr-only">Select an option</legend>
      {options.map((opt, i) => {
        const id = `${name}-${opt.value}`
        const checked = defaultValue === opt.value
        return (
          <span key={i} className="contents">
            <input
              type="radio"
              id={id}
              name={name}
              value={opt.value}
              defaultChecked={checked}
              className="peer sr-only"
            />
            <label
              htmlFor={id}
              className="cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors peer-checked:bg-surface-raised peer-checked:text-foreground peer-checked:shadow-sm"
            >
              {opt.label}
            </label>
          </span>
        )
      })}
    </fieldset>
  )
}
