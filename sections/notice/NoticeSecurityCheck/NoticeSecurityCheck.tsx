export type NoticeSecurityCheckProps = {
  body?: string
  reviewHref?: string
}
export function NoticeSecurityCheck({ body = 'A new device signed in to your account. Review activity to make sure it was you.', reviewHref = '#' }: NoticeSecurityCheckProps) {
  return (
    <aside role="alert" className="border-y border-warning-border bg-warning-bg px-6 py-3 text-warning-fg">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <p className="text-sm">🔐 {body}</p>
        <a href={reviewHref} className="rounded-md bg-warning-fg/15 px-3 py-1 text-xs font-semibold hover:bg-warning-fg/25">Review activity</a>
      </div>
    </aside>
  )
}
