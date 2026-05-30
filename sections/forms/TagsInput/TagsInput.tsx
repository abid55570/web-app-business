export type TagsInputProps = {
  name: string
  label: string
  defaultTags?: string[]
  placeholder?: string
  helper?: string
}

export function TagsInput({
  name,
  label,
  defaultTags = [],
  placeholder = 'Add tag, press Enter',
  helper,
}: TagsInputProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-foreground">
        {label}
      </span>
      <div className="rounded-md border border-border bg-background p-2">
        {defaultTags.length ? (
          <ul className="mb-2 flex flex-wrap gap-1.5">
            {defaultTags.map((t, i) => (
              <li
                key={i}
                className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-foreground"
              >
                {t}
                <button
                  type="button"
                  aria-label={`Remove ${t}`}
                  className="text-base leading-none text-muted-foreground hover:text-foreground"
                  data-remove-tag={t}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <input
          type="text"
          name={name}
          defaultValue={defaultTags.join(',')}
          placeholder={placeholder}
          autoComplete="off"
          className="block w-full bg-transparent px-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>
      {helper ? (
        <p className="mt-1 text-xs text-muted-foreground">
          {helper} · comma-separated
        </p>
      ) : null}
    </label>
  )
}
