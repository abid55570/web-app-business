export type AnnouncementModalProps = {
  id: string
  badgeLabel?: string
  title: string
  body: string
  imageUrl?: string
  primaryLabel?: string
  primaryHref?: string
  secondaryLabel?: string
  secondaryHref?: string
}

export function AnnouncementModal({
  id,
  badgeLabel = 'New',
  title,
  body,
  imageUrl,
  primaryLabel = 'Try it now',
  primaryHref,
  secondaryLabel = 'Later',
  secondaryHref = '#',
}: AnnouncementModalProps) {
  return (
    <div
      id={id}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${id}-title`}
      className="invisible fixed inset-0 z-50 grid place-items-center bg-black/60 opacity-0 transition-opacity target:visible target:opacity-100 [&:target]:visible [&:target]:opacity-100"
    >
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-surface-raised shadow-2xl">
        {imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imageUrl}
            alt=""
            className="aspect-[16/9] w-full object-cover"
          />
        ) : null}
        <div className="p-6">
          <span className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">
            {badgeLabel}
          </span>
          <h2
            id={`${id}-title`}
            className="mt-3 text-xl font-bold text-foreground"
          >
            {title}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{body}</p>
          <div className="mt-5 flex justify-end gap-2">
            <a
              href={secondaryHref}
              className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
            >
              {secondaryLabel}
            </a>
            {primaryHref ? (
              <a
                href={primaryHref}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                {primaryLabel}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
