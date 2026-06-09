export type IconCircleProps = {
  icon: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  tone?: 'brand' | 'info' | 'success' | 'warning' | 'danger' | 'neutral'
}

const SIZE_CLASS: Record<string, string> = {
  sm: 'h-10 w-10 text-base',
  md: 'h-14 w-14 text-2xl',
  lg: 'h-20 w-20 text-3xl',
  xl: 'h-28 w-28 text-5xl',
}

const TONE_CLASS: Record<string, string> = {
  brand:   'bg-primary/15 text-primary ring-primary/30',
  info:    'bg-sky-500/15 text-sky-600 dark:text-sky-300 ring-sky-500/30',
  success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 ring-emerald-500/30',
  warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 ring-amber-500/30',
  danger:  'bg-red-500/15 text-red-600 dark:text-red-300 ring-red-500/30',
  neutral: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 ring-slate-500/30',
}

export function IconCircle({ icon, size = 'md', tone = 'brand' }: IconCircleProps) {
  return (
    <div className="px-6 py-8 flex justify-center">
      <div className={`grid place-items-center rounded-full ring-1 ${SIZE_CLASS[size]} ${TONE_CLASS[tone]}`}>
        <span aria-hidden>{icon}</span>
      </div>
    </div>
  )
}
