export type TocEntry = { id: string; label: string }

export type TermsLayoutProps = {
  title: string
  lastUpdated?: string
  toc: TocEntry[]
  bodyHtml: string
}

export function TermsLayout({
  title,
  lastUpdated,
  toc,
  bodyHtml,
}: TermsLayoutProps) {
  return (
    <article className="px-6 py-12 lg:px-12">
      <header className="mx-auto mb-10 max-w-4xl">
        <h1 className="text-3xl font-bold text-foreground lg:text-4xl">
          {title}
        </h1>
        {lastUpdated ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        ) : null}
      </header>
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[16rem_1fr]">
        <nav
          aria-label="On this page"
          className="hidden lg:block lg:sticky lg:top-8 lg:self-start"
        >
          <ol className="space-y-1 text-sm">
            {toc.map((t, i) => (
              <li key={i}>
                <a
                  href={`#${t.id}`}
                  className="text-muted-foreground hover:text-primary"
                >
                  {t.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div
          className="prose max-w-none text-foreground"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
      </div>
    </article>
  )
}
