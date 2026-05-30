export type SpoilerProps = {
  summary: string
  children?: React.ReactNode
}

export function Spoiler({ summary, children }: SpoilerProps) {
  return (
    <details className="my-4 group rounded-lg border border-border bg-surface-raised px-4 py-3">
      <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-foreground list-none">
        {summary}
        <span
          aria-hidden
          className="text-xs text-muted-foreground transition-transform group-open:rotate-90"
        >
          ▸
        </span>
      </summary>
      <div className="mt-3 text-sm text-muted-foreground">{children}</div>
    </details>
  )
}
