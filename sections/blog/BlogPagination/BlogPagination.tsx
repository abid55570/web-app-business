export type BlogPaginationProps = {
  currentPage: number
  totalPages: number
  hrefTemplate?: string
}

export function BlogPagination({
  currentPage,
  totalPages,
  hrefTemplate = '?page={page}',
}: BlogPaginationProps) {
  if (totalPages <= 1) return null
  const href = (p: number) => hrefTemplate.replace('{page}', String(p))
  const pages = pageList(currentPage, totalPages)
  return (
    <nav
      aria-label="Pagination"
      className="flex justify-center gap-1 px-6 py-8"
    >
      {currentPage > 1 ? (
        <a
          href={href(currentPage - 1)}
          className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:bg-accent"
        >
          ‹ Prev
        </a>
      ) : null}
      {pages.map((p, i) =>
        p === '…' ? (
          <span
            key={`gap-${i}`}
            className="px-3 py-1.5 text-sm text-muted-foreground"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <a
            key={p}
            href={href(p)}
            aria-current={p === currentPage ? 'page' : undefined}
            className={`min-w-[2.25rem] rounded-md border px-3 py-1.5 text-center text-sm ${
              p === currentPage
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-foreground hover:bg-accent'
            }`}
          >
            {p}
          </a>
        ),
      )}
      {currentPage < totalPages ? (
        <a
          href={href(currentPage + 1)}
          className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:bg-accent"
        >
          Next ›
        </a>
      ) : null}
    </nav>
  )
}

function pageList(current: number, total: number): Array<number | '…'> {
  // Always show 1 + 2 around current + last; insert '…' when there's a gap > 1.
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: Array<number | '…'> = [1]
  if (current > 3) pages.push('…')
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p)
  }
  if (current < total - 2) pages.push('…')
  pages.push(total)
  return pages
}
