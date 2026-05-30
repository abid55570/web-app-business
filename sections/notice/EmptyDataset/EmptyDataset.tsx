export type EmptyDatasetProps = {
  icon?: string
  title: string
  body?: string
  primaryLabel?: string
  primaryHref?: string
  secondaryLabel?: string
  secondaryHref?: string
}

export function EmptyDataset({
  icon = '∅',
  title,
  body,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: EmptyDatasetProps) {
  return (
    <section className="mx-auto max-w-md rounded-xl border-2 border-dashed border-border bg-surface-sunken py-12 text-center">
      <span
        aria-hidden
        className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-surface-raised text-3xl text-muted-foreground"
      >
        {icon}
      </span>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      {body ? (
        <p className="mx-auto mt-1 max-w-sm px-4 text-sm text-muted-foreground">
          {body}
        </p>
      ) : null}
      {(primaryLabel || secondaryLabel) ? (
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {secondaryLabel && secondaryHref ? (
            <a
              href={secondaryHref}
              className="rounded-md border border-border bg-surface-raised px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
            >
              {secondaryLabel}
            </a>
          ) : null}
          {primaryLabel && primaryHref ? (
            <a
              href={primaryHref}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              {primaryLabel}
            </a>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
