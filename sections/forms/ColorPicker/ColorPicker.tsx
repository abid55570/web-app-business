export type ColorPickerProps = {
  name: string
  label: string
  defaultValue?: string
  presets?: string[]
  helper?: string
}

export function ColorPicker({
  name,
  label,
  defaultValue = '#3b82f6',
  presets,
  helper,
}: ColorPickerProps) {
  return (
    <fieldset>
      <legend className="mb-1 text-sm font-semibold text-foreground">
        {label}
      </legend>
      <div className="flex items-center gap-3">
        <input
          type="color"
          name={name}
          defaultValue={defaultValue}
          className="h-10 w-12 cursor-pointer rounded-md border border-border bg-background"
        />
        <input
          type="text"
          name={`${name}_hex`}
          defaultValue={defaultValue}
          pattern="^#[0-9a-fA-F]{6}$"
          className="w-32 rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground focus:border-primary focus:outline-none"
        />
      </div>
      {presets?.length ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {presets.map((p) => (
            <li key={p}>
              <button
                type="button"
                aria-label={`Use preset ${p}`}
                style={{ backgroundColor: p }}
                className="h-7 w-7 rounded-full border border-border shadow-sm hover:scale-110"
              />
            </li>
          ))}
        </ul>
      ) : null}
      {helper ? (
        <p className="mt-2 text-xs text-muted-foreground">{helper}</p>
      ) : null}
    </fieldset>
  )
}
