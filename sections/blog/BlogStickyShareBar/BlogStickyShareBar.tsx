export type BlogStickyShareBarProps = {
  shareUrl: string
  channels?: { label: string; href: string }[]
}

export function BlogStickyShareBar({
  shareUrl,
  channels = [
    { label: 'X', href: '#' },
    { label: 'LinkedIn', href: '#' },
    { label: 'Email', href: '#' },
  ],
}: BlogStickyShareBarProps) {
  return (
    <aside
      aria-label="Share this article"
      className="sticky top-24 hidden h-fit w-12 flex-col items-center gap-2 rounded-full border border-border bg-surface-raised p-2 lg:flex"
    >
      {channels.map((c, i) => (
        <a
          key={i}
          href={c.href}
          className="grid h-8 w-8 place-items-center rounded-full text-xs font-bold text-muted-foreground hover:bg-surface-overlay hover:text-foreground"
        >
          {c.label.charAt(0)}
        </a>
      ))}
      <hr className="my-1 w-6 border-border" />
      <a
        href={shareUrl}
        title="Copy link"
        className="grid h-8 w-8 place-items-center rounded-full text-xs font-bold text-muted-foreground hover:bg-surface-overlay hover:text-foreground"
      >
        🔗
      </a>
    </aside>
  )
}
