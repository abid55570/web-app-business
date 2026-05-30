export type MultiSelectOption = {
  label: string
  value: string
}

export type MultiSelectDropdownProps = {
  name: string
  label: string
  options: MultiSelectOption[]
  selected?: string[]
  size?: number
  helper?: string
}

export function MultiSelectDropdown({
  name,
  label,
  options,
  selected = [],
  size = 5,
  helper,
}: MultiSelectDropdownProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-foreground">
        {label}
      </span>
      <select
        name={`${name}[]`}
        multiple
        size={size}
        defaultValue={selected}
        className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {helper ? (
        <span className="mt-1 block text-xs text-muted-foreground">
          {helper} (hold Ctrl/Cmd to multi-select)
        </span>
      ) : null}
    </label>
  )
}
