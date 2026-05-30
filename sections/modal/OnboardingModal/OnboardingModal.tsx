export type OnboardingStep = {
  id: string
  title: string
  body: string
  imageUrl?: string
}

export type OnboardingModalProps = {
  id: string
  steps: OnboardingStep[]
  groupId: string
  skipHref?: string
}

export function OnboardingModal({
  id,
  steps,
  groupId,
  skipHref = '#',
}: OnboardingModalProps) {
  return (
    <div
      id={id}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome tour"
      className="invisible fixed inset-0 z-50 grid place-items-center bg-black/65 opacity-0 transition-opacity target:visible target:opacity-100 [&:target]:visible [&:target]:opacity-100"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-xl bg-surface-raised shadow-2xl">
        {steps.map((s, i) => (
          <input
            key={`r-${i}`}
            type="radio"
            id={`${groupId}-${s.id}`}
            name={groupId}
            defaultChecked={i === 0}
            className="peer/o sr-only"
          />
        ))}
        {steps.map((s, i) => (
          <div key={s.id} className="hidden peer-checked/o:block">
            {s.imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={s.imageUrl}
                alt=""
                className="aspect-video w-full bg-surface-sunken object-cover"
              />
            ) : null}
            <div className="p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Step {i + 1} of {steps.length}
              </p>
              <h2 className="mt-2 text-xl font-bold text-foreground">
                {s.title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </div>
          </div>
        ))}
        <footer className="flex items-center justify-between gap-3 border-t border-border bg-surface-sunken px-5 py-3">
          <a
            href={skipHref}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            Skip
          </a>
          <ul className="flex gap-1.5">
            {steps.map((s, i) => (
              <li key={i}>
                <label
                  htmlFor={`${groupId}-${s.id}`}
                  className="block h-2 w-2 cursor-pointer rounded-full bg-border peer-checked/o:bg-primary"
                >
                  <span className="sr-only">Step {i + 1}</span>
                </label>
              </li>
            ))}
          </ul>
          {steps.length > 0 ? (
            <label
              htmlFor={`${groupId}-${steps[steps.length - 1]!.id}`}
              className="cursor-pointer rounded-md bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
            >
              Next →
            </label>
          ) : null}
        </footer>
      </div>
    </div>
  )
}
