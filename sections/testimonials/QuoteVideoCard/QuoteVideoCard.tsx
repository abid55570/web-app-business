export type QuoteVideoCardProps = {
  quote: string
  authorName: string
  authorRole?: string
  videoEmbedUrl?: string
  posterUrl?: string
}
export function QuoteVideoCard({ quote, authorName, authorRole, videoEmbedUrl, posterUrl }: QuoteVideoCardProps) {
  return (
    <section className="px-6 py-12">
      <article className="mx-auto grid max-w-4xl items-center gap-8 rounded-2xl border border-border bg-surface-raised p-6 lg:grid-cols-2">
        <div className="aspect-video overflow-hidden rounded-xl bg-black">
          {videoEmbedUrl ? (
            <iframe src={videoEmbedUrl} className="h-full w-full" allow="autoplay; encrypted-media" allowFullScreen title="Customer story" />
          ) : posterUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={posterUrl} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div>
          <blockquote className="mb-3 text-lg italic text-foreground">&ldquo;{quote}&rdquo;</blockquote>
          <p className="text-sm font-semibold text-foreground">{authorName}</p>
          {authorRole ? <p className="text-xs text-muted-foreground">{authorRole}</p> : null}
        </div>
      </article>
    </section>
  )
}
