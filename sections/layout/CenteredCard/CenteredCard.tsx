export type CenteredCardProps = {
  title: string
  subtitle?: string
  children?: React.ReactNode
}

export function CenteredCard({ title, subtitle, children }: CenteredCardProps) {
  return (
    <main className="grid min-h-screen place-items-center bg-surface-sunken px-6 py-12">
      <section className="w-full max-w-md rounded-2xl border border-border bg-surface-raised p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
        <div className="mt-6">{children}</div>
      </section>
    </main>
  )
}
