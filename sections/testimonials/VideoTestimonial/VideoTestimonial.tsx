export type VideoTestimonialProps = {
  videoUrl: string
  posterUrl: string
  quote: string
  authorName: string
  authorRole: string
}

export function VideoTestimonial({
  videoUrl,
  posterUrl,
  quote,
  authorName,
  authorRole,
}: VideoTestimonialProps) {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2">
        <video
          controls
          preload="none"
          poster={posterUrl}
          className="aspect-video w-full rounded-xl object-cover shadow-xl"
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support embedded video.
        </video>
        <figure>
          <blockquote className="text-xl font-medium leading-snug text-foreground lg:text-2xl">
            &ldquo;{quote}&rdquo;
          </blockquote>
          <figcaption className="mt-5">
            <span className="block text-sm font-semibold text-foreground">
              {authorName}
            </span>
            <span className="block text-xs text-muted-foreground">
              {authorRole}
            </span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
