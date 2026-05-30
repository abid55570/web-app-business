export type FeatureSplitDiagonalProps = {
  leftTitle: string
  leftBody: string
  leftCtaLabel?: string
  leftCtaHref?: string
  rightTitle: string
  rightBody: string
  rightCtaLabel?: string
  rightCtaHref?: string
}

export function FeatureSplitDiagonal({
  leftTitle,
  leftBody,
  leftCtaLabel,
  leftCtaHref,
  rightTitle,
  rightBody,
  rightCtaLabel,
  rightCtaHref,
}: FeatureSplitDiagonalProps) {
  return (
    <section className="relative isolate overflow-hidden">
      <div
        className="absolute inset-0 -z-10 bg-primary"
        style={{ clipPath: 'polygon(0 0, 60% 0, 40% 100%, 0 100%)' }}
      />
      <div
        className="absolute inset-0 -z-10 bg-surface-raised"
        style={{ clipPath: 'polygon(60% 0, 100% 0, 100% 100%, 40% 100%)' }}
      />
      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-20 lg:grid-cols-2 lg:py-28">
        <article className="text-primary-foreground">
          <h3 className="text-2xl font-bold lg:text-3xl">{leftTitle}</h3>
          <p className="mt-3 max-w-sm text-base opacity-90">{leftBody}</p>
          {leftCtaLabel && leftCtaHref ? (
            <a
              href={leftCtaHref}
              className="mt-5 inline-flex items-center rounded-md bg-surface-raised px-5 py-2 text-sm font-semibold text-foreground hover:opacity-90"
            >
              {leftCtaLabel} →
            </a>
          ) : null}
        </article>
        <article className="text-foreground sm:pl-12">
          <h3 className="text-2xl font-bold lg:text-3xl">{rightTitle}</h3>
          <p className="mt-3 max-w-sm text-base text-muted-foreground">
            {rightBody}
          </p>
          {rightCtaLabel && rightCtaHref ? (
            <a
              href={rightCtaHref}
              className="mt-5 inline-flex items-center rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              {rightCtaLabel} →
            </a>
          ) : null}
        </article>
      </div>
    </section>
  )
}
