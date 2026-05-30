export type NoticeChangelogHighlightProps = {
  version: string
  date: string
  highlight: string
  ctaLabel?: string
  ctaHref?: string
}

export function NoticeChangelogHighlight({
  version,
  date,
  highlight,
  ctaLabel = "What's new",
  ctaHref = '/changelog',
}: NoticeChangelogHighlightProps) {
  return (
    <aside className="border-y border-info-border bg-info-bg px-6 py-3 text-info-fg">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <span className="rounded bg-info-fg/10 px-2 py-0.5 text-[10px] font-bold uppercase">
            New · {version}
          </span>
          <p className="text-sm">
            <strong>{highlight}</strong>{' '}
            <span className="text-xs opacity-70">· {date}</span>
          </p>
        </div>
        <a
          href={ctaHref}
          className="text-xs font-semibold underline hover:no-underline"
        >
          {ctaLabel} →
        </a>
      </div>
    </aside>
  )
}
