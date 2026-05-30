export type DownloadItem = {
  title: string
  description?: string
  href: string
  format: string
  sizeBytes: number
  iconColor?: 'primary' | 'success' | 'warning' | 'info'
}

export type DownloadListProps = {
  heading?: string
  items: DownloadItem[]
}

const ACCENT: Record<NonNullable<DownloadItem['iconColor']>, string> = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  info: 'bg-blue-100 text-blue-700',
}

function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`
  return `${(n / 1024 / 1024 / 1024).toFixed(1)} GB`
}

export function DownloadList({ heading, items }: DownloadListProps) {
  return (
    <section className="mx-auto max-w-3xl">
      {heading ? (
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          {heading}
        </h2>
      ) : null}
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={i}>
            <a
              href={it.href}
              download
              className="flex items-center gap-4 rounded-lg border border-border bg-surface-raised p-4 hover:border-primary"
            >
              <span
                aria-hidden
                className={`grid h-10 w-10 flex-none place-items-center rounded-md text-xs font-bold uppercase ${
                  ACCENT[it.iconColor ?? 'primary']
                }`}
              >
                {it.format}
              </span>
              <div className="flex-1">
                <p className="font-medium text-foreground">{it.title}</p>
                {it.description ? (
                  <p className="text-xs text-muted-foreground">
                    {it.description}
                  </p>
                ) : null}
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                {fmtBytes(it.sizeBytes)}
              </span>
              <span aria-hidden className="text-muted-foreground">
                ↓
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
