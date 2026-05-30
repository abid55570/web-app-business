export type FeedbackModalProps = {
  id: string
  triggerLabel: string
  title?: string
  topics: Array<{ value: string; label: string }>
  action: string
}

export function FeedbackModal({
  id,
  triggerLabel,
  title = 'Share your feedback',
  topics,
  action,
}: FeedbackModalProps) {
  return (
    <>
      <a
        href={`#${id}`}
        className="inline-flex items-center gap-2 rounded-md border border-border bg-surface-raised px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
      >
        <span aria-hidden>✎</span>
        {triggerLabel}
      </a>
      <div
        id={id}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        className="invisible fixed inset-0 z-50 grid place-items-center bg-black/60 opacity-0 transition-opacity target:visible target:opacity-100 [&:target]:visible [&:target]:opacity-100"
      >
        <div className="w-full max-w-md rounded-xl bg-surface-raised p-6 shadow-2xl">
          <h2
            id={`${id}-title`}
            className="text-lg font-semibold text-foreground"
          >
            {title}
          </h2>
          <form action={action} method="POST" className="mt-4 space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-foreground">
                Topic
              </span>
              <select
                name="topic"
                required
                className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                {topics.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-foreground">
                Your feedback
              </span>
              <textarea
                name="body"
                required
                rows={5}
                className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </label>
            <div className="flex justify-end gap-2">
              <a
                href="#"
                className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
              >
                Cancel
              </a>
              <button
                type="submit"
                className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
