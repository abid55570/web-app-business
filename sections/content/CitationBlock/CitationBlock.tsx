export type CitationBlockProps = {
  authors: string
  title: string
  journal?: string
  year: number
  doi?: string
  url?: string
  format?: 'apa' | 'mla' | 'chicago'
}

export function CitationBlock({
  authors,
  title,
  journal,
  year,
  doi,
  url,
  format = 'apa',
}: CitationBlockProps) {
  let rendered = ''
  if (format === 'apa') {
    rendered = `${authors} (${year}). ${title}.${journal ? ` ${journal}.` : ''}${doi ? ` https://doi.org/${doi}` : ''}`
  } else if (format === 'mla') {
    rendered = `${authors}. "${title}." ${journal ?? ''} ${year}.`
  } else {
    rendered = `${authors}. ${year}. "${title}." ${journal ?? ''}.`
  }
  return (
    <aside className="my-6 rounded-lg border-l-4 border-l-primary bg-surface-sunken p-4">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {format} citation
      </p>
      <p className="font-serif text-sm leading-relaxed text-foreground">
        {rendered}
      </p>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-xs font-semibold text-primary hover:underline"
        >
          Full text →
        </a>
      ) : null}
    </aside>
  )
}
