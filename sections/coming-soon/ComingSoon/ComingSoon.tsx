export type ComingSoonProps = {
  headline?: string
  subhead?: string
  launchAt?: string
  formAction: string
}

export function ComingSoon({
  headline = 'Something new is coming',
  subhead,
  launchAt,
  formAction,
}: ComingSoonProps) {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6 py-20 text-center">
      <h1 className="mb-4 text-5xl font-bold text-foreground lg:text-7xl">
        {headline}
      </h1>
      {subhead ? (
        <p className="mb-8 max-w-xl text-lg text-muted-foreground">
          {subhead}
        </p>
      ) : null}
      {launchAt ? (
        <time
          dateTime={launchAt}
          className="mb-10 inline-block rounded-full border border-primary px-5 py-2 text-sm font-semibold text-primary"
        >
          Launching {launchAt}
        </time>
      ) : null}
      <form
        action={formAction}
        method="POST"
        className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
      >
        <input
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          autoComplete="email"
          className="flex-1 rounded-md border border-border bg-background px-4 py-2.5 text-foreground"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Notify me
        </button>
      </form>
    </section>
  )
}
