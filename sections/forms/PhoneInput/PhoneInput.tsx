export type PhoneInputCountry = {
  code: string
  dial: string
  label: string
}

export type PhoneInputProps = {
  name: string
  label: string
  countries: PhoneInputCountry[]
  defaultDial?: string
  placeholder?: string
  required?: boolean
}

export function PhoneInput({
  name,
  label,
  countries,
  defaultDial,
  placeholder = '555 123 4567',
  required = false,
}: PhoneInputProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-foreground">
        {label}
        {required ? <span className="ml-1 text-red-600">*</span> : null}
      </span>
      <div className="flex">
        <select
          name={`${name}_dial`}
          defaultValue={defaultDial}
          className="rounded-l-md border border-r-0 border-border bg-background px-2 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
        >
          {countries.map((c) => (
            <option key={c.code} value={c.dial}>
              {c.dial} ({c.code})
            </option>
          ))}
        </select>
        <input
          type="tel"
          name={name}
          required={required}
          placeholder={placeholder}
          inputMode="tel"
          pattern="[0-9\s\-]+"
          className="flex-1 rounded-r-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
      </div>
    </label>
  )
}
