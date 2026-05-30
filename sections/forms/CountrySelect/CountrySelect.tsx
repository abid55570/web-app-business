export type CountrySelectOption = {
  code: string
  name: string
  flag?: string
}

export type CountrySelectProps = {
  name: string
  label: string
  options: CountrySelectOption[]
  defaultValue?: string
  required?: boolean
}

export function CountrySelect({
  name,
  label,
  options,
  defaultValue,
  required = false,
}: CountrySelectProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-foreground">
        {label}
        {required ? <span className="ml-1 text-red-600">*</span> : null}
      </span>
      <select
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
      >
        <option value="">— select a country —</option>
        {options.map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag ? `${c.flag} ` : ''}
            {c.name}
          </option>
        ))}
      </select>
    </label>
  )
}
