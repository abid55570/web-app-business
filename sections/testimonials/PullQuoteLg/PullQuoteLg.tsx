export type PullQuoteLgProps = {
  quote: string
  authorName: string
  authorRole: string
  authorAvatarUrl?: string
}

export function PullQuoteLg({
  quote,
  authorName,
  authorRole,
  authorAvatarUrl,
}: PullQuoteLgProps) {
  return (
    <section className="px-6 py-20 lg:py-28">
      <figure className="mx-auto max-w-4xl text-center">
        <span
          aria-hidden
          className="block font-serif text-7xl leading-none text-primary lg:text-8xl"
        >
          “
        </span>
        <blockquote className="-mt-6 text-3xl font-bold leading-tight text-foreground lg:text-5xl">
          {quote}
        </blockquote>
        <figcaption className="mt-10 flex items-center justify-center gap-3">
          {authorAvatarUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={authorAvatarUrl}
              alt=""
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : null}
          <span className="text-left">
            <span className="block text-base font-semibold text-foreground">
              {authorName}
            </span>
            <span className="block text-sm text-muted-foreground">
              {authorRole}
            </span>
          </span>
        </figcaption>
      </figure>
    </section>
  )
}
