export type FormPhoneInputProps = {
  label?: string
  name?: string
  defaultCountryCode?: string
  required?: boolean
}

export function FormPhoneInput({
  label = 'Phone number',
  name = 'phone',
  defaultCountryCode = '+1',
  required = false,
}: FormPhoneInputProps) {
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
        <div className="flex gap-2">
          <select
            name={`${name}-cc`}
            defaultValue={defaultCountryCode}
            className="w-24 rounded-md border border-border bg-surface-raised px-2 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="+1">+1 US</option>
            <option value="+44">+44 UK</option>
            <option value="+91">+91 IN</option>
            <option value="+33">+33 FR</option>
            <option value="+49">+49 DE</option>
            <option value="+81">+81 JP</option>
            <option value="+61">+61 AU</option>
          </select>
          <input
            id={name}
            name={name}
            type="tel"
            required={required}
            placeholder="555 0123"
            className="flex-1 rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>
    </section>
  )
}
