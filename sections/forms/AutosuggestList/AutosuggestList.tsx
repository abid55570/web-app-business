export type AutosuggestItem = {
  value: string
  label: string
  description?: string
  iconUrl?: string
}

export type AutosuggestListProps = {
  name: string
  label: string
  q?: string
  items: AutosuggestItem[]
  placeholder?: string
}

export function AutosuggestList({
  name,
  label,
  q = '',
  items,
  placeholder = 'Start typing…',
}: AutosuggestListProps) {
  return (
    <fieldset>
      <legend className="mb-1 text-sm font-semibold text-foreground">
        {label}
      </legend>
      <input
        type="search"
        name={name}
        defaultValue={q}
        placeholder={placeholder}
        autoComplete="off"
        className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
      />
      {items.length ? (
        <ul className="mt-2 max-h-64 overflow-y-auto rounded-md border border-border bg-surface-raised">
          {items.map((it) => (
            <li key={it.value}>
              <label className="flex cursor-pointer items-center gap-3 border-b border-border px-3 py-2 last:border-b-0 hover:bg-accent">
                <input
                  type="radio"
                  name={`${name}_pick`}
                  value={it.value}
                  className="sr-only"
                />
                {it.iconUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={it.iconUrl}
                    alt=""
                    className="h-6 w-6 flex-none rounded object-cover"
                  />
                ) : null}
                <span className="flex-1 text-sm">
                  <span className="block font-medium text-foreground">
                    {it.label}
                  </span>
                  {it.description ? (
                    <span className="text-xs text-muted-foreground">
                      {it.description}
                    </span>
                  ) : null}
                </span>
              </label>
            </li>
          ))}
        </ul>
      ) : null}
    </fieldset>
  )
}
