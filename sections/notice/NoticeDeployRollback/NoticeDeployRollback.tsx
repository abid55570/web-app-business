export type NoticeDeployRollbackProps = {
  deployId: string
  rolledBackAt: string
  reason?: string
  postmortemHref?: string
}

export function NoticeDeployRollback({
  deployId,
  rolledBackAt,
  reason,
  postmortemHref,
}: NoticeDeployRollbackProps) {
  return (
    <aside
      role="alert"
      className="border-l-4 border-error-border bg-error-bg px-6 py-4 text-error-fg"
    >
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">
            Deploy {deployId} was rolled back
          </p>
          <p className="text-xs">
            Rolled back {rolledBackAt}
            {reason ? ` · reason: ${reason}` : ''}
          </p>
        </div>
        {postmortemHref ? (
          <a
            href={postmortemHref}
            className="rounded-md bg-error-fg/10 px-3 py-1 text-xs font-semibold hover:bg-error-fg/20"
          >
            Postmortem
          </a>
        ) : null}
      </div>
    </aside>
  )
}
