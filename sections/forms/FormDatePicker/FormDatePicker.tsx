export type FormDatePickerProps = {
  label?: string
  name?: string
  required?: boolean
  helpText?: string
  defaultValue?: string
}

export function FormDatePicker({
  label = 'Pick a date',
  name = 'date',
  required = false,
  helpText,
  defaultValue,
}: FormDatePickerProps) {
  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-md">
        <label
          htmlFor={name}
          className="mb-2 block text-sm font-medium text-foreground"
        >
          {label}
          {required ? <span className="ml-1 text-error-fg">*</span> : null}
        </label>
        <input
          id={name}
          name={name}
          type="date"
          required={required}
          defaultValue={defaultValue}
          className="w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {helpText ? (
          <p className="mt-1 text-xs text-muted-foreground">{helpText}</p>
        ) : null}
      </div>
    </section>
  )
}
