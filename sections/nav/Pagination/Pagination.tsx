export type PaginationProps = {
  currentPage: number
  totalPages: number
  baseHref: string
}

function pageNumbers(current: number, total: number): Array<number | '…'> {
  const out: Array<number | '…'> = []
  const add = (n: number) => out.push(n)
  add(1)
  if (current > 4) out.push('…')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    add(i)
  }
  if (current < total - 3) out.push('…')
  if (total > 1) add(total)
  return out
}

export function Pagination({ currentPage, totalPages, baseHref }: PaginationProps) {
  const items = pageNumbers(currentPage, totalPages)
  const prev = Math.max(1, currentPage - 1)
  const next = Math.min(totalPages, currentPage + 1)
  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1">
      <a
        href={`${baseHref}?page=${prev}`}
        aria-label="Previous page"
        className={`rounded-md border border-border px-3 py-1.5 text-sm ${
          currentPage === 1
            ? 'pointer-events-none opacity-40'
            : 'text-foreground hover:bg-accent'
        }`}
      >
        ←
      </a>
      {items.map((it, i) =>
        it === '…' ? (
          <span key={i} className="px-2 text-muted-foreground">
            …
          </span>
        ) : (
          <a
            key={i}
            href={`${baseHref}?page=${it}`}
            aria-current={it === currentPage ? 'page' : undefined}
            className={`min-w-[2.25rem] rounded-md px-3 py-1.5 text-center text-sm ${
              it === currentPage
                ? 'bg-primary text-primary-foreground font-semibold'
                : 'border border-border text-foreground hover:bg-accent'
            }`}
          >
            {it}
          </a>
        ),
      )}
      <a
        href={`${baseHref}?page=${next}`}
        aria-label="Next page"
        className={`rounded-md border border-border px-3 py-1.5 text-sm ${
          currentPage === totalPages
            ? 'pointer-events-none opacity-40'
            : 'text-foreground hover:bg-accent'
        }`}
      >
        →
      </a>
    </nav>
  )
}
