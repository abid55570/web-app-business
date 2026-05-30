export type VideoItem = {
  title: string
  embedUrl: string
  thumbUrl?: string
  durationSecs?: number
}

export type VideoGalleryProps = {
  videos: VideoItem[]
}

function fmt(secs?: number): string {
  if (!secs) return ''
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function VideoGallery({ videos }: VideoGalleryProps) {
  return (
    <section className="px-6 py-12 lg:px-12">
      <ul className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((v, i) => (
          <li key={i}>
            <article className="overflow-hidden rounded-lg border border-border bg-surface-raised">
              <div className="relative aspect-video">
                <iframe
                  src={v.embedUrl}
                  title={v.title}
                  className="h-full w-full"
                  loading="lazy"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                />
              </div>
              <div className="p-4">
                <p className="text-sm font-semibold text-foreground">{v.title}</p>
                {v.durationSecs ? (
                  <p className="mt-1 text-xs text-muted-foreground">{fmt(v.durationSecs)}</p>
                ) : null}
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  )
}
