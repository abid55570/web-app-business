export type ContentQuoteCalloutProps = {
  quote: string
  attribution?: string
  variant?: 'info' | 'success' | 'warning' | 'error'
}

const variantStyles: Record<string, string> = {
  info: 'border-info-border bg-info-bg text-info-fg',
  success: 'border-success-border bg-success-bg text-success-fg',
  warning: 'border-warning-border bg-warning-bg text-warning-fg',
  error: 'border-error-border bg-error-bg text-error-fg',
}

export function ContentQuoteCallout({
  quote,
  attribution,
  variant = 'info',
}: ContentQuoteCalloutProps) {
  return (
    <aside
      className={`mx-auto my-8 max-w-3xl rounded-lg border-l-4 px-5 py-4 ${
        variantStyles[variant]
      }`}
    >
      <p className="text-base italic">&ldquo;{quote}&rdquo;</p>
      {attribution ? (
        <p className="mt-2 text-xs font-medium opacity-80">— {attribution}</p>
      ) : null}
    </aside>
  )
}
