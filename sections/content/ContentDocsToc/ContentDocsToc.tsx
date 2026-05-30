export type ContentDocsTocSection = {
  id: string
  label: string
  level?: 1 | 2 | 3
}

export type ContentDocsTocProps = {
  heading?: string
  sections: ContentDocsTocSection[]
}

export function ContentDocsToc({
  heading = 'On this page',
  sections,
}: ContentDocsTocProps) {
  return (
    <nav className="sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto border-l border-border px-4 py-6 text-sm">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {heading}
      </h3>
      <ul className="space-y-1">
        {sections.map((s, i) => (
          <li
            key={i}
            style={{ paddingLeft: ((s.level ?? 1) - 1) * 12 }}
          >
            <a
              href={`#${s.id}`}
              className="block py-1 text-muted-foreground hover:text-foreground"
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
