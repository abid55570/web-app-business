export type QuoteAvatarStackAvatar = {
  imageUrl?: string
  initial?: string
}

export type QuoteAvatarStackProps = {
  quote: string
  context: string
  avatars: QuoteAvatarStackAvatar[]
  totalCount?: number
}

export function QuoteAvatarStack({
  quote,
  context,
  avatars,
  totalCount,
}: QuoteAvatarStackProps) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-4 flex justify-center -space-x-3">
          {avatars.map((a, i) =>
            a.imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                key={i}
                src={a.imageUrl}
                alt=""
                className="h-12 w-12 rounded-full border-2 border-surface-raised object-cover"
              />
            ) : (
              <span
                key={i}
                className="grid h-12 w-12 place-items-center rounded-full border-2 border-surface-raised bg-primary text-sm font-bold text-primary-foreground"
              >
                {a.initial ?? '?'}
              </span>
            ),
          )}
        </div>
        <blockquote className="mb-3 text-2xl font-semibold leading-snug text-foreground">
          &ldquo;{quote}&rdquo;
        </blockquote>
        <p className="text-sm text-muted-foreground">
          {context}
          {totalCount ? ` · ${totalCount.toLocaleString()} happy users` : ''}
        </p>
      </div>
    </section>
  )
}
