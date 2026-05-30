export type TextareaAutogrowProps = {
  name: string
  label: string
  placeholder?: string
  maxLength?: number
  rows?: number
  required?: boolean
  helper?: string
}

export function TextareaAutogrow({
  name,
  label,
  placeholder,
  maxLength = 500,
  rows = 4,
  required = false,
  helper,
}: TextareaAutogrowProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-foreground">
        {label}
        {required ? <span className="ml-1 text-red-600">*</span> : null}
      </span>
      <textarea
        name={name}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        required={required}
        className="block w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
      />
      <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
        <span>{helper ?? ''}</span>
        <span>max {maxLength} chars</span>
      </div>
    </label>
  )
}
