export type SearchableSelectOption = {
  value: string
  label: string
  group?: string
}

export type SearchableSelectProps = {
  name: string
  label: string
  options: SearchableSelectOption[]
  defaultValue?: string
  placeholder?: string
  required?: boolean
}

export function SearchableSelect({
  name,
  label,
  options,
  defaultValue,
  placeholder = 'Search…',
  required = false,
}: SearchableSelectProps) {
  const listId = `${name}-options`
  const grouped = options.reduce<Record<string, SearchableSelectOption[]>>(
    (acc, o) => {
      const k = o.group ?? ''
      ;(acc[k] ||= []).push(o)
      return acc
    },
    {},
  )
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-foreground">
        {label}
        {required ? <span className="ml-1 text-red-600">*</span> : null}
      </span>
      <input
        type="text"
        name={name}
        list={listId}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
      />
      <datalist id={listId}>
        {Object.entries(grouped).map(([g, opts]) =>
          opts.map((o) => (
            <option key={o.value} value={o.value} label={g ? `${o.label} — ${g}` : o.label}>
              {o.label}
            </option>
          )),
        )}
      </datalist>
    </label>
  )
}
