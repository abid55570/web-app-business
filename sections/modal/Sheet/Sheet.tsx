export type SheetProps = {
  id: string
  triggerLabel: string
  title: string
  children?: React.ReactNode
}

export function Sheet({ id, triggerLabel, title, children }: SheetProps) {
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
        className="invisible fixed inset-x-0 bottom-0 z-50 translate-y-full transform rounded-t-2xl border-t border-border bg-surface-raised shadow-2xl transition-all duration-300 target:visible target:translate-y-0 [&:target]:visible [&:target]:translate-y-0"
      >
        <div className="mx-auto max-w-2xl px-6 pb-6 pt-4">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" aria-hidden />
          <header className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            <a
              href="#"
              aria-label="Close sheet"
              className="text-2xl leading-none text-muted-foreground hover:text-foreground"
            >
              ×
            </a>
          </header>
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </>
  )
}
