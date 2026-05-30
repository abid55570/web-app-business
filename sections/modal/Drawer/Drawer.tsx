export type DrawerProps = {
  id: string
  title: string
  side?: 'left' | 'right'
  triggerLabel: string
  children?: React.ReactNode
}

export function Drawer({
  id,
  title,
  side = 'right',
  triggerLabel,
  children,
}: DrawerProps) {
  const slideClass =
    side === 'right'
      ? 'right-0 [&:target]:translate-x-0 translate-x-full border-l'
      : 'left-0 [&:target]:translate-x-0 -translate-x-full border-r'
  return (
    <>
      <a
        href={`#${id}`}
        className="inline-flex items-center rounded-md border border-border bg-surface-raised px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
      >
        {triggerLabel}
      </a>
      <div
        id={id}
        role="dialog"
        aria-label={title}
        className={`fixed bottom-0 top-0 z-40 w-80 transform border-border bg-surface-raised shadow-2xl transition-transform ${slideClass}`}
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <a
            href="#"
            aria-label="Close drawer"
            className="text-2xl leading-none text-muted-foreground hover:text-foreground"
          >
            ×
          </a>
        </header>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </>
  )
}
