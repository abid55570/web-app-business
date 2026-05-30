export type AuthSplitProps = {
  brand: string
  quote?: string
  quoteAuthor?: string
  imageUrl?: string
  children?: React.ReactNode
}

export function AuthSplit({
  brand,
  quote,
  quoteAuthor,
  imageUrl,
  children,
}: AuthSplitProps) {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <p className="mb-12 text-lg font-bold text-foreground">{brand}</p>
        <div className="mx-auto w-full max-w-sm">{children}</div>
      </section>
      <aside
        className="relative hidden flex-col justify-end overflow-hidden bg-primary p-12 text-primary-foreground lg:flex"
        style={
          imageUrl
            ? {
                backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.65)), url(${imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      >
        {quote ? (
          <figure>
            <blockquote className="text-2xl font-medium leading-snug">
              &ldquo;{quote}&rdquo;
            </blockquote>
            {quoteAuthor ? (
              <figcaption className="mt-3 text-sm opacity-90">
                — {quoteAuthor}
              </figcaption>
            ) : null}
          </figure>
        ) : null}
      </aside>
    </main>
  )
}
