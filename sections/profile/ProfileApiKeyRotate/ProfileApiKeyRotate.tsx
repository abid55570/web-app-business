export type ProfileApiKeyRotateProps = {
  keyName: string
  keyPrefix: string
  lastRotated: string
  ageDays: number
  warnThresholdDays?: number
  rotateLabel?: string
}

export function ProfileApiKeyRotate({
  keyName,
  keyPrefix,
  lastRotated,
  ageDays,
  warnThresholdDays = 90,
  rotateLabel = 'Rotate now',
}: ProfileApiKeyRotateProps) {
  const stale = ageDays >= warnThresholdDays
  return (
    <section className="px-6 py-8">
      <div className="mx-auto max-w-2xl rounded-xl border border-border bg-surface-raised p-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              {keyName}
            </h3>
            <code className="font-mono text-xs text-muted-foreground">
              {keyPrefix}••••••••••
            </code>
          </div>
          {stale ? (
            <span className="rounded-full bg-warning-bg px-2 py-0.5 text-[10px] font-bold uppercase text-warning-fg">
              Stale
            </span>
          ) : (
            <span className="rounded-full bg-success-bg px-2 py-0.5 text-[10px] font-bold uppercase text-success-fg">
              Healthy
            </span>
          )}
        </div>
        <p className="mb-4 text-xs text-muted-foreground">
          Last rotated {lastRotated} · {ageDays} days ago
          {stale ? ` (above ${warnThresholdDays}-day threshold)` : ''}
        </p>
        <button
          type="button"
          className={
            stale
              ? 'rounded-lg bg-warning-fg px-4 py-2 text-sm font-semibold text-white'
              : 'rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-overlay'
          }
        >
          {rotateLabel}
        </button>
      </div>
    </section>
  )
}
