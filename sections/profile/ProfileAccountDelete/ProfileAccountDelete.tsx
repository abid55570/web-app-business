export type ProfileAccountDeleteProps = {
  heading?: string
  body?: string
  confirmPhrase: string
  deleteLabel?: string
}

export function ProfileAccountDelete({
  heading = 'Delete account',
  body = 'This permanently removes your account, all workspaces you own, and all associated data. This cannot be undone.',
  confirmPhrase,
  deleteLabel = 'Delete my account',
}: ProfileAccountDeleteProps) {
  return (
    <section className="px-6 py-8">
      <div className="mx-auto max-w-2xl rounded-xl border-2 border-error-border bg-error-bg/40 p-6">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-error-fg">
          Danger zone
        </p>
        <h2 className="mb-2 text-xl font-semibold text-error-fg">{heading}</h2>
        <p className="mb-5 text-sm text-foreground">{body}</p>
        <label className="mb-2 block text-xs font-medium text-foreground">
          Type{' '}
          <code className="rounded bg-surface-overlay px-1.5 py-0.5 font-mono text-xs">
            {confirmPhrase}
          </code>{' '}
          to confirm:
        </label>
        <input
          type="text"
          placeholder={confirmPhrase}
          className="mb-4 w-full rounded-md border border-error-border bg-surface-raised px-3 py-2 text-sm font-mono text-foreground"
        />
        <button
          type="button"
          className="rounded-lg bg-error-fg px-5 py-2.5 text-sm font-semibold text-white"
        >
          {deleteLabel}
        </button>
      </div>
    </section>
  )
}
