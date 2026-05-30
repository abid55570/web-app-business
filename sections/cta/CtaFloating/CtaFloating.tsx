export type CtaFloatingProps = {
  label: string
  href: string
  icon?: string
  position?: 'bottom-right' | 'bottom-left'
  pulse?: boolean
}

export function CtaFloating({
  label,
  href,
  icon = '💬',
  position = 'bottom-right',
  pulse = false,
}: CtaFloatingProps) {
  const pos =
    position === 'bottom-left' ? 'bottom-6 left-6' : 'bottom-6 right-6'
  return (
    <a
      href={href}
      className={`fixed ${pos} z-40 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-2xl hover:opacity-90 ${
        pulse ? 'animate-pulse-soft' : ''
      }`}
    >
      <span aria-hidden className="text-base">
        {icon}
      </span>
      {label}
    </a>
  )
}
