export type TestimonialSingleProps = {
  quote: string
  authorName: string
  authorRole: string
  authorAvatarUrl?: string
  companyLogoUrl?: string
}

export function TestimonialSingle({
  quote,
  authorName,
  authorRole,
  authorAvatarUrl,
  companyLogoUrl,
}: TestimonialSingleProps) {
  return (
    <section className="px-6 py-20">
      <figure className="mx-auto max-w-3xl text-center">
        {companyLogoUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={companyLogoUrl}
            alt=""
            className="mx-auto h-8 opacity-70"
          />
        ) : null}
        <blockquote className="mt-6 text-2xl font-medium leading-snug text-foreground lg:text-3xl">
          &ldquo;{quote}&rdquo;
        </blockquote>
        <figcaption className="mt-8 flex items-center justify-center gap-3">
          {authorAvatarUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={authorAvatarUrl}
              alt=""
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : null}
          <span className="text-left">
            <span className="block text-sm font-semibold text-foreground">
              {authorName}
            </span>
            <span className="block text-xs text-muted-foreground">
              {authorRole}
            </span>
          </span>
        </figcaption>
      </figure>
    </section>
  )
}
