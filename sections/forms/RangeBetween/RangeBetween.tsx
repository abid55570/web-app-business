export type RangeBetweenProps = {
  name: string
  label: string
  min: number
  max: number
  step?: number
  defaultMin: number
  defaultMax: number
  unit?: string
}

export function RangeBetween({
  name,
  label,
  min,
  max,
  step = 1,
  defaultMin,
  defaultMax,
  unit = '',
}: RangeBetweenProps) {
  return (
    <fieldset>
      <legend className="mb-2 flex items-baseline justify-between text-sm font-semibold text-foreground">
        <span>{label}</span>
        <span className="font-mono text-xs text-muted-foreground">
          {defaultMin}{unit} — {defaultMax}{unit}
        </span>
      </legend>
      <div className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs text-muted-foreground">
            Min
          </span>
          <input
            type="range"
            name={`${name}_min`}
            min={min}
            max={max}
            step={step}
            defaultValue={defaultMin}
            className="block w-full accent-primary"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-muted-foreground">
            Max
          </span>
          <input
            type="range"
            name={`${name}_max`}
            min={min}
            max={max}
            step={step}
            defaultValue={defaultMax}
            className="block w-full accent-primary"
          />
        </label>
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </fieldset>
  )
}
