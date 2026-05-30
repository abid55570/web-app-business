export type UpdateChecklistChange = {
  label: string
  kind: 'feature' | 'fix' | 'breaking'
}

export type UpdateChecklistProps = {
  version: string
  releasedAt: string
  changes: UpdateChecklistChange[]
  updateAction?: string
  releaseNotesHref?: string
}

const KIND_PALETTE: Record<UpdateChecklistChange['kind'], string> = {
  feature: 'bg-emerald-100 text-emerald-800',
  fix: 'bg-blue-100 text-blue-800',
  breaking: 'bg-red-100 text-red-800',
}

export function UpdateChecklist({
  version,
  releasedAt,
  changes,
  updateAction,
  releaseNotesHref,
}: UpdateChecklistProps) {
  return (
    <aside className="rounded-xl border border-border bg-surface-raised p-5">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-base font-bold text-foreground">
            Update available
            <span className="ml-2 font-mono text-xs font-semibold text-primary">
              {version}
            </span>
          </p>
          <p className="text-xs text-muted-foreground">{releasedAt}</p>
        </div>
        {updateAction ? (
          <form action={updateAction} method="POST">
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Update now
            </button>
          </form>
        ) : null}
      </header>
      <ul className="mt-4 space-y-1.5 text-sm">
        {changes.map((c, i) => (
          <li key={i} className="flex items-start gap-2">
            <span
              className={`mt-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                KIND_PALETTE[c.kind]
              }`}
            >
              {c.kind}
            </span>
            <span className="text-foreground">{c.label}</span>
          </li>
        ))}
      </ul>
      {releaseNotesHref ? (
        <a
          href={releaseNotesHref}
          className="mt-3 inline-block text-xs font-semibold text-primary hover:underline"
        >
          Full release notes →
        </a>
      ) : null}
    </aside>
  )
}
