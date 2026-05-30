export type NPSPollProps = {
  question?: string
  action: string
}

export function NPSPoll({
  question = 'How likely are you to recommend us?',
  action,
}: NPSPollProps) {
  return (
    <section className="px-6 py-12 lg:px-12">
      <form
        action={action}
        method="POST"
        className="mx-auto max-w-2xl rounded-xl border border-border bg-surface-raised p-8"
      >
        <fieldset>
          <legend className="mb-6 text-center text-lg font-semibold text-foreground">
            {question}
          </legend>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {Array.from({ length: 11 }).map((_, i) => (
              <label
                key={i}
                className="cursor-pointer"
                aria-label={`${i} out of 10`}
              >
                <input
                  type="radio"
                  name="score"
                  value={i}
                  required
                  className="peer sr-only"
                />
                <span className="block h-10 w-10 rounded-md border border-border text-center leading-10 text-sm font-medium text-foreground peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground hover:bg-accent">
                  {i}
                </span>
              </label>
            ))}
          </div>
          <p className="mt-3 flex justify-between text-xs text-muted-foreground">
            <span>Not likely</span>
            <span>Extremely likely</span>
          </p>
        </fieldset>
        <button
          type="submit"
          className="mt-6 w-full rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Submit
        </button>
      </form>
    </section>
  )
}
