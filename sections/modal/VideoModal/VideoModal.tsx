export type VideoModalProps = {
  id: string
  triggerLabel: string
  embedUrl: string
  title: string
}

export function VideoModal({
  id,
  triggerLabel,
  embedUrl,
  title,
}: VideoModalProps) {
  return (
    <>
      <a
        href={`#${id}`}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
      >
        <span aria-hidden>▶</span>
        {triggerLabel}
      </a>
      <div
        id={id}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="invisible fixed inset-0 z-50 grid place-items-center bg-black/85 opacity-0 transition-opacity target:visible target:opacity-100 [&:target]:visible [&:target]:opacity-100"
      >
        <a
          href="#"
          aria-label="Close video"
          className="absolute right-6 top-6 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20"
        >
          ×
        </a>
        <div className="w-[min(90vw,1024px)] overflow-hidden rounded-xl shadow-2xl">
          <iframe
            src={embedUrl}
            title={title}
            className="aspect-video w-full"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </div>
    </>
  )
}
