export type ApiTokensEmptyProps = {
  docsHref: string
  createAction: string
}

export function ApiTokensEmpty({
  docsHref,
  createAction,
}: ApiTokensEmptyProps) {
  return (
    <section className="mx-auto max-w-2xl rounded-xl border-2 border-dashed border-border bg-surface-sunken p-10 text-center">
      <span
        aria-hidden
        className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-surface-raised text-2xl text-muted-foreground"
      >
        🔑
      </span>
      <h2 className="mt-4 text-lg font-semibold text-foreground">
        No API tokens yet
      </h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        API tokens let your code authenticate as you. Keep them secret — they
        grant the same access as your password.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <a
          href={docsHref}
          className="rounded-md border border-border bg-surface-raised px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
        >
          Read the docs
        </a>
        <form action={createAction} method="POST">
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            + Create first token
          </button>
        </form>
      </div>
    </section>
  )
}
