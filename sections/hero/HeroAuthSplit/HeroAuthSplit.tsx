export type HeroAuthSplitProps = {
  heading: string
  subheading?: string
  formTitle?: string
  signInLabel?: string
}
export function HeroAuthSplit({ heading, subheading, formTitle = 'Sign in', signInLabel = 'Continue' }: HeroAuthSplitProps) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2">
        <div>
          <h1 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl">{heading}</h1>
          {subheading ? <p className="text-base text-muted-foreground">{subheading}</p> : null}
        </div>
        <form className="rounded-2xl border border-border bg-surface-raised p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">{formTitle}</h2>
          <input type="email" placeholder="you@company.com" className="mb-3 w-full rounded-md border border-border bg-surface-base px-3 py-2 text-sm" required />
          <input type="password" placeholder="Password" className="mb-4 w-full rounded-md border border-border bg-surface-base px-3 py-2 text-sm" required />
          <button type="submit" className="w-full rounded-md bg-primary py-2 text-sm font-semibold text-primary-foreground">{signInLabel}</button>
        </form>
      </div>
    </section>
  )
}
