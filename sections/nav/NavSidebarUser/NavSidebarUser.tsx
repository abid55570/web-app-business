export type NavSidebarUserProps = {
  userName: string
  userEmail: string
  avatarUrl?: string
  workspaceName?: string
  links: { label: string; href: string; active?: boolean }[]
}
export function NavSidebarUser({ userName, userEmail, avatarUrl, workspaceName, links }: NavSidebarUserProps) {
  return (
    <aside className="flex h-screen w-60 flex-col border-r border-border bg-surface-raised">
      <div className="border-b border-border p-4">
        {workspaceName ? <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{workspaceName}</p> : null}
        <div className="mt-2 flex items-center gap-2">
          {avatarUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{userName.charAt(0)}</span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{userName}</p>
            <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-0.5">
          {links.map((l, i) => (
            <li key={i}>
              <a href={l.href} className={l.active ? 'block rounded bg-primary/10 px-2 py-1.5 text-sm font-semibold text-primary' : 'block rounded px-2 py-1.5 text-sm text-foreground hover:bg-surface-overlay'}>{l.label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
