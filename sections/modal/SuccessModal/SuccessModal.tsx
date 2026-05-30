export type SuccessModalProps = {
  id: string
  title: string
  body: string
  primaryLabel?: string
  primaryHref: string
  secondaryLabel?: string
  secondaryHref?: string
}

export function SuccessModal({
  id,
  title,
  body,
  primaryLabel = 'Continue',
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: SuccessModalProps) {
  return (
    <div
      id={id}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${id}-title`}
      className="invisible fixed inset-0 z-50 grid place-items-center bg-black/65 opacity-0 transition-opacity target:visible target:opacity-100 [&:target]:visible [&:target]:opacity-100"
    >
      <div className="w-full max-w-md rounded-xl bg-surface-raised p-8 text-center shadow-2xl">
        <span
          aria-hidden
          className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-3xl text-emerald-600"
        >
          ✓
        </span>
        <h2
          id={`${id}-title`}
          className="mt-4 text-xl font-bold text-foreground"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{body}</p>
        <div className="mt-6 flex justify-center gap-2">
          {secondaryLabel && secondaryHref ? (
            <a
              href={secondaryHref}
              className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
            >
              {secondaryLabel}
            </a>
          ) : null}
          <a
            href={primaryHref}
            className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            {primaryLabel}
          </a>
        </div>
      </div>
    </div>
  )
}
