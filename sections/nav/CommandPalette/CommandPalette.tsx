export type CommandItem = {
  label: string
  shortcut?: string
  href: string
}

export type CommandGroup = {
  group: string
  items: CommandItem[]
}

export type CommandPaletteProps = {
  open?: boolean
  placeholder?: string
  commands: CommandGroup[]
}

export function CommandPalette({
  open = false,
  placeholder = 'Type a command or search…',
  commands,
}: CommandPaletteProps) {
  return (
    <dialog
      open={open}
      className="mx-auto w-full max-w-xl rounded-xl border border-border bg-surface-raised p-0 shadow-2xl backdrop:bg-black/50"
    >
      <input
        type="search"
        placeholder={placeholder}
        autoFocus
        className="w-full border-b border-border bg-transparent px-5 py-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
      <div className="max-h-80 overflow-y-auto p-2">
        {commands.map((g, i) => (
          <div key={i} className="mb-3 last:mb-0">
            <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {g.group}
            </p>
            <ul>
              {g.items.map((item, j) => (
                <li key={j}>
                  <a
                    href={item.href}
                    className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent"
                  >
                    <span>{item.label}</span>
                    {item.shortcut ? (
                      <kbd className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                        {item.shortcut}
                      </kbd>
                    ) : null}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <form method="dialog" className="border-t border-border px-3 py-2 text-right">
        <button className="text-xs text-muted-foreground hover:text-foreground">
          Esc to close
        </button>
      </form>
    </dialog>
  )
}
