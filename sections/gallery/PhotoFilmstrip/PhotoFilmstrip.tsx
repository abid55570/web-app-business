export type PhotoFilmstripPhoto = {
  id: string
  src: string
  alt?: string
}

export type PhotoFilmstripProps = {
  heading?: string
  photos: PhotoFilmstripPhoto[]
  groupId: string
}

export function PhotoFilmstrip({
  heading,
  photos,
  groupId,
}: PhotoFilmstripProps) {
  return (
    <section className="px-6 py-12">
      {heading ? (
        <h2 className="mx-auto mb-5 max-w-4xl text-xl font-semibold text-foreground">
          {heading}
        </h2>
      ) : null}
      <div className="mx-auto max-w-4xl">
        {photos.map((p, i) => (
          <input
            key={`r-${i}`}
            type="radio"
            id={`${groupId}-${p.id}`}
            name={groupId}
            defaultChecked={i === 0}
            className="peer/p sr-only"
          />
        ))}
        <div className="overflow-hidden rounded-xl border border-border bg-surface-sunken">
          {photos.map((p) => (
            <span key={p.id} className="hidden peer-checked/p:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.src}
                alt={p.alt ?? ''}
                className="aspect-video w-full object-cover"
              />
            </span>
          ))}
        </div>
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:thin]">
          {photos.map((p) => (
            <li key={p.id} className="flex-none">
              <label
                htmlFor={`${groupId}-${p.id}`}
                className="block cursor-pointer overflow-hidden rounded-md border-2 border-transparent peer-checked/p:border-primary"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.src}
                  alt=""
                  className="h-16 w-24 object-cover"
                />
              </label>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
