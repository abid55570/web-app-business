export type NotFound404Props = {
  title?: string
  body?: string
  homeHref?: string
  homeLabel?: string
}

export function NotFound404({
  title = 'Page not found',
  body = "We couldn't find that page. The link might be old, or there's a typo.",
  homeHref = '/',
  homeLabel = 'Take me home',
}: NotFound404Props) {
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-20 text-center">
      <p className="mb-2 text-7xl font-bold text-primary lg:text-9xl">404</p>
      <h1 className="mb-3 text-3xl font-bold text-foreground lg:text-4xl">
        {title}
      </h1>
      <p className="mb-8 max-w-md text-base text-muted-foreground">{body}</p>
      <a
        href={homeHref}
        className="inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
      >
        ← {homeLabel}
      </a>
    </section>
  )
}
