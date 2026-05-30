'use client'

/**
 * TopNav — sticky horizontal navigation. Mobile collapses to a hamburger
 * disclosure that toggles a vertical menu below the bar.
 */
import { useState } from 'react'

export type NavLink = { label: string; href: string }

export type TopNavProps = {
  brandName: string
  brandHref?: string
  links?: NavLink[]
  ctaLabel?: string
  ctaHref?: string
  sticky?: boolean
}

export function TopNav({
  brandName,
  brandHref = '/',
  links = [],
  ctaLabel,
  ctaHref,
  sticky = true,
}: TopNavProps) {
  const [open, setOpen] = useState(false)
  const positionClass = sticky
    ? 'sticky top-0 z-40'
    : 'relative'
  return (
    <header
      className={`${positionClass} border-b border-border bg-background/80 backdrop-blur`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3 lg:px-12">
        <a
          href={brandHref}
          className="text-base font-semibold text-foreground"
        >
          {brandName}
        </a>

        <ul className="hidden gap-6 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          {ctaLabel ? (
            <a
              href={ctaHref ?? '#'}
              className="hidden rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 md:inline-flex"
            >
              {ctaLabel}
            </a>
          ) : null}
          <button
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border md:hidden"
          >
            ☰
          </button>
        </div>
      </nav>
      {open ? (
        <ul className="space-y-1 border-t border-border bg-background px-6 py-3 md:hidden">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="block rounded px-2 py-2 text-sm text-foreground hover:bg-accent"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            </li>
          ))}
          {ctaLabel ? (
            <li>
              <a
                href={ctaHref ?? '#'}
                className="block rounded bg-primary px-2 py-2 text-center text-sm font-semibold text-primary-foreground"
                onClick={() => setOpen(false)}
              >
                {ctaLabel}
              </a>
            </li>
          ) : null}
        </ul>
      ) : null}
    </header>
  )
}
