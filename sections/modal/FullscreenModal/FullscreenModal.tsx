export type FullscreenModalProps = {
  id: string
  triggerLabel: string
  title: string
  children?: React.ReactNode
}

export function FullscreenModal({
  id,
  triggerLabel,
  title,
  children,
}: FullscreenModalProps) {
  return (
    <>
      <a
        href={`#${id}`}
        className="inline-flex items-center rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
      >
        {triggerLabel}
      </a>
      <div
        id={id}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="invisible fixed inset-0 z-50 bg-surface-base opacity-0 transition-opacity target:visible target:opacity-100 [&:target]:visible [&:target]:opacity-100"
      >
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <a
            href="#"
            aria-label="Close fullscreen modal"
            className="grid h-10 w-10 place-items-center rounded-md border border-border text-foreground hover:bg-accent"
          >
            ×
          </a>
        </header>
        <main className="overflow-y-auto px-6 py-8">{children}</main>
      </div>
    </>
  )
}
