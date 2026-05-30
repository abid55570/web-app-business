export type EmptyInboxIllustratedProps = {
  heading?: string
  body?: string
  ctaLabel?: string
  ctaHref?: string
}

export function EmptyInboxIllustrated({
  heading = 'Your inbox is empty',
  body = 'When new messages arrive, they will show up here.',
  ctaLabel,
  ctaHref = '#',
}: EmptyInboxIllustratedProps) {
  return (
    <section className="grid place-items-center px-6 py-16">
      <div className="max-w-sm text-center">
        <svg
          viewBox="0 0 200 200"
          className="mx-auto mb-4 h-32 w-32 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M40 80h120v60a20 20 0 0 1-20 20H60a20 20 0 0 1-20-20z" />
          <path d="M40 80l30-40h60l30 40" />
          <path d="M40 120h40l10 16h20l10-16h40" />
        </svg>
        <h3 className="mb-2 text-lg font-semibold text-foreground">{heading}</h3>
        <p className="mb-4 text-sm text-muted-foreground">{body}</p>
        {ctaLabel ? (
          <a
            href={ctaHref}
            className="inline-block rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
          >
            {ctaLabel}
          </a>
        ) : null}
      </div>
    </section>
  )
}
