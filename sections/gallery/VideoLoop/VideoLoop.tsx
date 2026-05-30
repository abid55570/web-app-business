export type VideoLoopProps = {
  videoUrl: string
  posterUrl?: string
  caption?: string
  rounded?: 'lg' | 'xl' | '2xl' | '3xl'
}

export function VideoLoop({
  videoUrl,
  posterUrl,
  caption,
  rounded = '2xl',
}: VideoLoopProps) {
  const r = `rounded-${rounded}`
  return (
    <figure className="mx-auto max-w-3xl">
      <video
        autoPlay
        loop
        muted
        playsInline
        poster={posterUrl}
        className={`w-full object-cover shadow-lg ${r}`}
      >
        <source src={videoUrl} type="video/mp4" />
      </video>
      {caption ? (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
