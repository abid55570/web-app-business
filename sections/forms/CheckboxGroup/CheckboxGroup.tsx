export type CheckboxOption = {
  label: string
  value: string
  description?: string
  defaultChecked?: boolean
}

export type CheckboxGroupProps = {
  name: string
  legend: string
  options: CheckboxOption[]
}

export function CheckboxGroup({ name, legend, options }: CheckboxGroupProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-foreground">
        {legend}
      </legend>
      {options.map((opt, i) => (
        <label
          key={i}
          className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-surface-raised p-3 hover:border-primary"
        >
          <input
            type="checkbox"
            name={name}
            value={opt.value}
            defaultChecked={opt.defaultChecked}
            className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
          />
          <span className="flex-1 text-sm">
            <span className="block font-medium text-foreground">
              {opt.label}
            </span>
            {opt.description ? (
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {opt.description}
              </span>
            ) : null}
          </span>
        </label>
      ))}
    </fieldset>
  )
}
