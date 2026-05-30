export type RangeSliderProps = {
  label: string
  name: string
  min?: number
  max?: number
  step?: number
  defaultValue?: number
}

export function RangeSlider({
  label,
  name,
  min = 0,
  max = 100,
  step = 1,
  defaultValue,
}: RangeSliderProps) {
  const initial = defaultValue ?? Math.floor((min + max) / 2)
  return (
    <div className="px-6 py-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-1 flex items-center justify-between">
          <label
            htmlFor={`b-dash-range-${name}`}
            className="text-sm font-medium text-foreground"
          >
            {label}
          </label>
          <output
            htmlFor={`b-dash-range-${name}`}
            className="text-sm font-semibold text-primary"
          >
            {initial}
          </output>
        </div>
        <input
          id={`b-dash-range-${name}`}
          name={name}
          type="range"
          min={min}
          max={max}
          step={step}
          defaultValue={initial}
          className="w-full accent-primary"
        />
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  )
}
