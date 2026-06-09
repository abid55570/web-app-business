export type BadgePillProps = {
  text: string
  tone?: 'info' | 'success' | 'warning' | 'danger' | 'neutral' | 'brand'
  dot?: boolean
}

const TONE_CLASS: Record<string, string> = {
  info:    'bg-sky-500/15 text-sky-600 dark:text-sky-300 border-sky-500/25',
  success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/25',
  warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/25',
  danger:  'bg-red-500/15 text-red-600 dark:text-red-300 border-red-500/25',
  neutral: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/25',
  brand:   'bg-primary/15 text-primary border-primary/30',
}

const DOT_CLASS: Record<string, string> = {
  info:    'bg-sky-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger:  'bg-red-500',
  neutral: 'bg-slate-500',
  brand:   'bg-primary',
}

export function BadgePill({ text, tone = 'info', dot = true }: BadgePillProps) {
  return (
    <div className="px-6 py-4 flex justify-center">
      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${TONE_CLASS[tone] ?? TONE_CLASS.info}`}>
        {dot ? <span className={`h-1.5 w-1.5 rounded-full ${DOT_CLASS[tone] ?? DOT_CLASS.info}`} /> : null}
        {text}
      </span>
    </div>
  )
}
