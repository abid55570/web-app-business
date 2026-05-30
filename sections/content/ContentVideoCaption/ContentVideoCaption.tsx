export type ContentVideoCaptionProps = {
  videoEmbedUrl: string
  videoTitle?: string
  caption: string
  attribution?: string
}

export function ContentVideoCaption({
  videoEmbedUrl,
  videoTitle = 'Embedded video',
  caption,
  attribution,
}: ContentVideoCaptionProps) {
  return (
    <figure className="mx-auto max-w-3xl px-6 py-8">
      <div className="aspect-video overflow-hidden rounded-xl bg-black">
        <iframe
          src={videoEmbedUrl}
          title={videoTitle}
          allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
      <figcaption className="mt-3 text-center text-sm text-muted-foreground">
        {caption}
        {attribution ? (
          <span className="block text-xs italic opacity-80">
            — {attribution}
          </span>
        ) : null}
      </figcaption>
    </figure>
  )
}
