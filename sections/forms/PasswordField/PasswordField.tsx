export type PasswordFieldProps = {
  name: string
  label: string
  placeholder?: string
  minLength?: number
  required?: boolean
  autoComplete?: string
  helper?: string
}

export function PasswordField({
  name,
  label,
  placeholder = '••••••••',
  minLength = 12,
  required = false,
  autoComplete = 'new-password',
  helper,
}: PasswordFieldProps) {
  const toggleId = `${name}-show`
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-foreground">
        {label}
        {required ? <span className="ml-1 text-red-600">*</span> : null}
      </span>
      <div className="relative">
        <input
          type="password"
          name={name}
          required={required}
          minLength={minLength}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="block w-full rounded-md border border-border bg-background px-3 py-2 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none peer/pf"
        />
        <input type="checkbox" id={toggleId} className="peer/sh sr-only" />
        <label
          htmlFor={toggleId}
          className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded px-2 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
          aria-label="Show or hide password"
        >
          Show
        </label>
      </div>
      {helper ? (
        <span className="mt-1 block text-xs text-muted-foreground">
          {helper} · min {minLength} chars
        </span>
      ) : null}
    </label>
  )
}
