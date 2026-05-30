export type UpdateBannerProps = {
  version: string
  message: string
  reloadAction?: string
}

export function UpdateBanner({
  version,
  message,
  reloadAction,
}: UpdateBannerProps) {
  return (
    <div
      role="status"
      className="flex items-center justify-between gap-3 border-b border-border bg-primary/10 px-5 py-3 text-sm text-foreground"
    >
      <p>
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-primary">
          {version}
        </span>
        <span className="ml-2">{message}</span>
      </p>
      {reloadAction ? (
        <form action={reloadAction} method="POST">
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
          >
            Reload
          </button>
        </form>
      ) : null}
    </div>
  )
}
