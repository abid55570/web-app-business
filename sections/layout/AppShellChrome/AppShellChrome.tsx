export type AppShellChromeProps = {
  brand: string
  topRight?: React.ReactNode
  children?: React.ReactNode
}

export function AppShellChrome({
  brand,
  topRight,
  children,
}: AppShellChromeProps) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-base">
      <header className="flex items-center justify-between border-b border-border bg-surface-raised px-4 py-2.5">
        <p className="text-sm font-semibold text-foreground">{brand}</p>
        <div className="flex items-center gap-3">{topRight}</div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
