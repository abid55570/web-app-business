export type BlogShareBarProps = {
  title: string
  url: string
}

export function BlogShareBar({ title, url }: BlogShareBarProps) {
  const t = encodeURIComponent(title)
  const u = encodeURIComponent(url)
  return (
    <aside
      aria-label="Share article"
      className="my-8 flex flex-wrap items-center gap-3 border-y border-border py-4"
    >
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Share
      </span>
      <ul className="flex gap-2">
        <li>
          <a
            href={`https://twitter.com/intent/tweet?text=${t}&url=${u}`}
            target="_blank"
            rel="noopener noreferrer"
            className="grid h-8 w-8 place-items-center rounded-full border border-border bg-surface-raised text-sm hover:bg-accent"
            aria-label="Share on X / Twitter"
          >
            𝕏
          </a>
        </li>
        <li>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${u}`}
            target="_blank"
            rel="noopener noreferrer"
            className="grid h-8 w-8 place-items-center rounded-full border border-border bg-surface-raised text-sm hover:bg-accent"
            aria-label="Share on LinkedIn"
          >
            in
          </a>
        </li>
        <li>
          <a
            href={`https://news.ycombinator.com/submitlink?u=${u}&t=${t}`}
            target="_blank"
            rel="noopener noreferrer"
            className="grid h-8 w-8 place-items-center rounded-full border border-border bg-surface-raised text-sm hover:bg-accent"
            aria-label="Submit to Hacker News"
          >
            Y
          </a>
        </li>
        <li>
          <a
            href={`mailto:?subject=${t}&body=${u}`}
            className="grid h-8 w-8 place-items-center rounded-full border border-border bg-surface-raised text-sm hover:bg-accent"
            aria-label="Share via email"
          >
            ✉
          </a>
        </li>
      </ul>
    </aside>
  )
}
