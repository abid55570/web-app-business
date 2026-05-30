export type WizardStep = {
  label: string
  contentHtml: string
}

export type MultiStepFormProps = {
  heading: string
  action: string
  steps: WizardStep[]
}

export function MultiStepForm({ heading, action, steps }: MultiStepFormProps) {
  return (
    <section className="px-6 py-12 lg:px-12">
      <form
        action={action}
        method="POST"
        className="mx-auto max-w-2xl rounded-xl border border-border bg-surface-raised p-8"
      >
        <h2 className="mb-2 text-xl font-bold text-foreground">{heading}</h2>
        <ol className="mb-6 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {steps.map((s, i) => (
            <li
              key={i}
              className="flex items-center gap-2"
              aria-current={i === 0 ? 'step' : undefined}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background font-semibold text-foreground">
                {i + 1}
              </span>
              {s.label}
            </li>
          ))}
        </ol>
        {steps.map((s, i) => (
          <fieldset
            key={i}
            className="mb-6"
            aria-label={`Step ${i + 1}: ${s.label}`}
          >
            <legend className="mb-3 text-sm font-semibold text-foreground">
              {i + 1}. {s.label}
            </legend>
            <div
              className="grid gap-3 text-sm"
              dangerouslySetInnerHTML={{ __html: s.contentHtml }}
            />
          </fieldset>
        ))}
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="reset"
            className="rounded-md border border-border px-5 py-2 text-sm font-semibold text-foreground hover:bg-accent"
          >
            Clear
          </button>
          <button
            type="submit"
            className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Submit
          </button>
        </div>
      </form>
    </section>
  )
}
