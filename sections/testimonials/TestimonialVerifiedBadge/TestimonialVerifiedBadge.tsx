export type TestimonialVerifiedBadgeProps = {
  quote: string
  authorName: string
  authorRole: string
  source: string
  verifiedDate?: string
  avatarUrl?: string
}

export function TestimonialVerifiedBadge({
  quote,
  authorName,
  authorRole,
  source,
  verifiedDate,
  avatarUrl,
}: TestimonialVerifiedBadgeProps) {
  return (
    <section className="px-6 py-12">
      <article className="mx-auto max-w-2xl rounded-2xl border border-border bg-surface-raised p-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={avatarUrl}
                alt=""
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <span className="grid h-12 w-12 place-items-center rounded-full bg-primary text-base font-bold text-primary-foreground">
                {authorName.charAt(0)}
              </span>
            )}
            <div>
              <p className="text-sm font-semibold text-foreground">
                {authorName}
              </p>
              <p className="text-xs text-muted-foreground">{authorRole}</p>
            </div>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-info-bg px-2.5 py-0.5 text-[10px] font-bold uppercase text-info-fg">
            ✓ Verified
          </span>
        </div>
        <blockquote className="mb-3 text-base italic text-foreground">
          &ldquo;{quote}&rdquo;
        </blockquote>
        <p className="text-xs text-muted-foreground">
          via {source}
          {verifiedDate ? ` · ${verifiedDate}` : ''}
        </p>
      </article>
    </section>
  )
}
