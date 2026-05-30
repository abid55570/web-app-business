export type UserMenuItem = {
  label: string
  href: string
  danger?: boolean
}

export type UserMenuProps = {
  name: string
  email: string
  avatarUrl?: string
  items: UserMenuItem[]
}

export function UserMenu({ name, email, avatarUrl, items }: UserMenuProps) {
  return (
    <details className="relative inline-block">
      <summary className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-surface-raised p-1 pr-3 list-none">
        {avatarUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={avatarUrl}
            alt=""
            className="h-7 w-7 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
          >
            {name.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="text-sm font-medium text-foreground">{name}</span>
        <span aria-hidden className="text-xs text-muted-foreground">
          ▾
        </span>
      </summary>
      <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-border bg-surface-raised shadow-lg">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-foreground">{name}</p>
          <p className="truncate text-xs text-muted-foreground">{email}</p>
        </div>
        <ul className="py-1">
          {items.map((it, i) => (
            <li key={i}>
              <a
                href={it.href}
                className={`block px-4 py-2 text-sm hover:bg-accent ${
                  it.danger
                    ? 'text-red-600 hover:text-red-700'
                    : 'text-foreground'
                }`}
              >
                {it.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </details>
  )
}
