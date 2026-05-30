export type NoticeBetaAccessProps = {
  featureName: string
  body?: string
  feedbackHref?: string
}

export function NoticeBetaAccess({
  featureName,
  body = "You're using an early preview. Things may change.",
  feedbackHref,
}: NoticeBetaAccessProps) {
  return (
    <aside className="border-y border-info-border bg-info-bg px-6 py-3 text-info-fg">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-3 text-sm">
          <span className="rounded bg-info-fg/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            Beta
          </span>
          <strong>{featureName}</strong>
          <span className="opacity-80">· {body}</span>
        </p>
        {feedbackHref ? (
          <a
            href={feedbackHref}
            className="text-xs font-semibold underline hover:no-underline"
          >
            Send feedback
          </a>
        ) : null}
      </div>
    </aside>
  )
}
