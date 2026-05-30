export type BlogReadingItem = {
  id: string
  title: string
  href: string
  excerpt?: string
  imageUrl?: string
  savedAt: string
  removeAction: string
}

export type BlogReadingListProps = {
  heading?: string
  items: BlogReadingItem[]
  emptyLabel?: string
}

export function BlogReadingList({
  heading = 'Reading list',
  items,
  emptyLabel = 'Nothing saved yet.',
}: BlogReadingListProps) {
  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-2xl rounded-lg border border-dashed border-border bg-surface-sunken p-8 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </section>
    )
  }
  return (
    <section className="mx-auto max-w-3xl">
      <h2 className="mb-3 text-lg font-semibold text-foreground">{heading}</h2>
      <ul className="space-y-3">
        {items.map((it) => (
          <li
            key={it.id}
            className="flex items-start gap-4 rounded-lg border border-border bg-surface-raised p-4"
          >
            {it.imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={it.imageUrl}
                alt=""
                className="h-16 w-24 flex-none rounded-md object-cover"
              />
            ) : null}
            <div className="flex-1">
              <a
                href={it.href}
                className="font-semibold text-foreground hover:underline"
              >
                {it.title}
              </a>
              {it.excerpt ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {it.excerpt}
                </p>
              ) : null}
              <p className="mt-2 text-[11px] text-muted-foreground">
                Saved {it.savedAt}
              </p>
            </div>
            <form action={it.removeAction} method="POST">
              <button
                type="submit"
                aria-label="Remove from reading list"
                className="text-xl leading-none text-muted-foreground hover:text-red-600"
              >
                ×
              </button>
            </form>
          </li>
        ))}
      </ul>
    </section>
  )
}
