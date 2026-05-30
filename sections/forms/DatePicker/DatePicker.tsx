export type DatePickerProps = {
  name: string
  label: string
  defaultValue?: string
  min?: string
  max?: string
  required?: boolean
  helper?: string
}

export function DatePicker({
  name,
  label,
  defaultValue,
  min,
  max,
  required = false,
  helper,
}: DatePickerProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-foreground">
        {label}
        {required ? <span className="ml-1 text-red-600">*</span> : null}
      </span>
      <input
        type="date"
        name={name}
        defaultValue={defaultValue}
        min={min}
        max={max}
        required={required}
        className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
      />
      {helper ? (
        <span className="mt-1 block text-xs text-muted-foreground">
          {helper}
        </span>
      ) : null}
    </label>
  )
}
