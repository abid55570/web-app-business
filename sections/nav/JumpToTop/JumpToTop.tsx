export type JumpToTopProps = {
  label?: string
  href?: string
}

export function JumpToTop({
  label = 'Back to top',
  href = '#top',
}: JumpToTopProps) {
  return (
    <a
      href={href}
      aria-label={label}
      className="fixed bottom-6 right-6 z-40 grid h-12 w-12 place-items-center rounded-full border border-border bg-surface-raised text-foreground shadow-lg transition-opacity hover:opacity-100"
    >
      <span aria-hidden className="text-xl">
        ↑
      </span>
    </a>
  )
}
