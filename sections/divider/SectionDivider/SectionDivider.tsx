/**
 * SectionDivider — slim visual gap. 3 variants: line, dots, label.
 * Decorative; aria-hidden so screen readers skip it.
 */
export type SectionDividerProps = {
  variant?: 'line' | 'dots' | 'label'
  label?: string
}

export function SectionDivider({
  variant = 'line',
  label,
}: SectionDividerProps) {
  if (variant === 'dots') {
    return (
      <div
        aria-hidden="true"
        className="flex items-center justify-center gap-2 px-6 py-10"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-border" />
        <span className="h-1.5 w-1.5 rounded-full bg-border" />
        <span className="h-1.5 w-1.5 rounded-full bg-border" />
      </div>
    )
  }
  if (variant === 'label' && label) {
    return (
      <div className="flex items-center gap-4 px-6 py-10 lg:px-12">
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
      </div>
    )
  }
  return (
    <hr
      aria-hidden="true"
      className="mx-auto my-8 h-px max-w-6xl border-0 bg-border"
    />
  )
}
