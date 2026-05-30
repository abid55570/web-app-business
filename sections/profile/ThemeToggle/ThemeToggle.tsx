export type ThemeToggleProps = {
  current?: 'light' | 'dark' | 'system'
  action: string
}

const OPTIONS: Array<{
  value: NonNullable<ThemeToggleProps['current']>
  label: string
  icon: string
}> = [
  { value: 'light', label: 'Light', icon: '☀' },
  { value: 'dark', label: 'Dark', icon: '☾' },
  { value: 'system', label: 'System', icon: '◐' },
]

export function ThemeToggle({
  current = 'system',
  action,
}: ThemeToggleProps) {
  return (
    <form action={action} method="POST" className="inline-block">
      <fieldset className="inline-flex rounded-full border border-border bg-surface-raised p-1">
        <legend className="sr-only">Theme</legend>
        {OPTIONS.map((opt) => {
          const id = `b-dash-theme-${opt.value}`
          return (
            <span key={opt.value} className="contents">
              <input
                type="radio"
                id={id}
                name="theme"
                value={opt.value}
                defaultChecked={current === opt.value}
                className="peer/t sr-only"
              />
              <label
                htmlFor={id}
                title={opt.label}
                className="grid h-8 w-9 cursor-pointer place-items-center rounded-full text-sm text-muted-foreground peer-checked/t:bg-primary peer-checked/t:text-primary-foreground"
              >
                <span aria-hidden>{opt.icon}</span>
                <span className="sr-only">{opt.label}</span>
              </label>
            </span>
          )
        })}
      </fieldset>
      <button type="submit" className="sr-only">
        Apply theme
      </button>
    </form>
  )
}
