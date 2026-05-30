export type FormColorPickerProps = {
  label?: string
  name?: string
  defaultValue?: string
  helpText?: string
}

export function FormColorPicker({
  label = 'Pick a color',
  name = 'color',
  defaultValue = '#3b82f6',
  helpText,
}: FormColorPickerProps) {
  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-md">
        <label
          htmlFor={name}
          className="mb-2 block text-sm font-medium text-foreground"
        >
          {label}
        </label>
        <div className="flex items-center gap-3">
          <input
            id={name}
            name={name}
            type="color"
            defaultValue={defaultValue}
            className="h-12 w-12 cursor-pointer rounded-md border border-border bg-surface-raised"
          />
          <code className="rounded-md border border-border bg-surface-raised px-3 py-2 text-sm font-mono text-foreground">
            {defaultValue}
          </code>
        </div>
        {helpText ? (
          <p className="mt-1 text-xs text-muted-foreground">{helpText}</p>
        ) : null}
      </div>
    </section>
  )
}
