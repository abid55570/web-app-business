export type FormRangeProps = {
  label?: string
  name?: string
  min?: number
  max?: number
  step?: number
  defaultValue?: number
  unit?: string
}

export function FormRange({
  label = 'Value',
  name = 'value',
  min = 0,
  max = 100,
  step = 1,
  defaultValue = 50,
  unit = '',
}: FormRangeProps) {
  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-md">
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor={name} className="text-sm font-medium text-foreground">
            {label}
          </label>
          <span className="text-sm font-mono text-muted-foreground">
            {defaultValue}
            {unit}
          </span>
        </div>
        <input
          id={name}
          name={name}
          type="range"
          min={min}
          max={max}
          step={step}
          defaultValue={defaultValue}
          className="w-full accent-primary"
        />
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
          <span>
            {min}
            {unit}
          </span>
          <span>
            {max}
            {unit}
          </span>
        </div>
      </div>
    </section>
  )
}
