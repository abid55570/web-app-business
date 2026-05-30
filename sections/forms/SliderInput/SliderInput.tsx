export type SliderInputProps = {
  name: string
  label: string
  min?: number
  max?: number
  step?: number
  defaultValue: number
  unit?: string
  helper?: string
}

export function SliderInput({
  name,
  label,
  min = 0,
  max = 100,
  step = 1,
  defaultValue,
  unit,
  helper,
}: SliderInputProps) {
  return (
    <fieldset>
      <legend className="mb-2 flex items-baseline justify-between text-sm font-semibold text-foreground">
        <span>{label}</span>
        <span className="text-base font-bold text-primary">
          {defaultValue}
          {unit ? <span className="ml-0.5 text-xs text-muted-foreground">{unit}</span> : null}
        </span>
      </legend>
      <input
        type="range"
        name={name}
        min={min}
        max={max}
        step={step}
        defaultValue={defaultValue}
        className="block w-full accent-primary"
      />
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
      {helper ? (
        <p className="mt-2 text-xs text-muted-foreground">{helper}</p>
      ) : null}
    </fieldset>
  )
}
