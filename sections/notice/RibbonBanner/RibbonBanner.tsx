export type RibbonBannerProps = {
  label: string
  position?: 'top-left' | 'top-right'
  variant?: 'primary' | 'success' | 'warning' | 'danger'
}

const VARIANT: Record<NonNullable<RibbonBannerProps['variant']>, string> = {
  primary: 'bg-primary text-primary-foreground',
  success: 'bg-emerald-600 text-white',
  warning: 'bg-amber-500 text-black',
  danger: 'bg-red-600 text-white',
}

export function RibbonBanner({
  label,
  position = 'top-right',
  variant = 'primary',
}: RibbonBannerProps) {
  const isRight = position === 'top-right'
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute top-4 z-10 inline-block px-10 py-1 text-xs font-bold uppercase tracking-widest shadow-md ${
        VARIANT[variant]
      } ${
        isRight
          ? 'right-0 origin-top-right -rotate-45 translate-x-1/3 translate-y-3'
          : 'left-0 origin-top-left rotate-45 -translate-x-1/3 translate-y-3'
      }`}
    >
      {label}
    </span>
  )
}
