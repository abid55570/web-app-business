export type AutosaveStatusProps = {
  status: 'idle' | 'saving' | 'saved' | 'error'
  lastSavedAt?: string
  errorMessage?: string
}

const TEXT: Record<AutosaveStatusProps['status'], string> = {
  idle: 'No changes',
  saving: 'Saving…',
  saved: 'Saved',
  error: 'Failed to save',
}

const COLOR: Record<AutosaveStatusProps['status'], string> = {
  idle: 'text-muted-foreground',
  saving: 'text-amber-600',
  saved: 'text-emerald-600',
  error: 'text-red-600',
}

const DOT: Record<AutosaveStatusProps['status'], string> = {
  idle: 'bg-muted-foreground/40',
  saving: 'bg-amber-500 animate-pulse',
  saved: 'bg-emerald-500',
  error: 'bg-red-500',
}

export function AutosaveStatus({
  status,
  lastSavedAt,
  errorMessage,
}: AutosaveStatusProps) {
  return (
    <p
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-2 text-xs font-medium ${
        COLOR[status]
      }`}
    >
      <span aria-hidden className={`h-2 w-2 rounded-full ${DOT[status]}`} />
      {status === 'error' && errorMessage ? errorMessage : TEXT[status]}
      {status === 'saved' && lastSavedAt ? (
        <span className="text-muted-foreground">· {lastSavedAt}</span>
      ) : null}
    </p>
  )
}
