export type CalloutBoxProps = {
  heading: string
  body: string
  tone?: 'info' | 'tip' | 'warning' | 'danger'
  icon?: string
}

const TONE_CLASS: Record<string, string> = {
  info:    'bg-sky-500/10 border-sky-500/30 text-sky-900 dark:text-sky-100',
  tip:     'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-100',
  warning: 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-100',
  danger:  'bg-red-500/10 border-red-500/30 text-red-900 dark:text-red-100',
}

const DEFAULT_ICON: Record<string, string> = {
  info: 'ℹ️',
  tip: '💡',
  warning: '⚠️',
  danger: '🚫',
}

export function CalloutBox({ heading, body, tone = 'info', icon }: CalloutBoxProps) {
  const finalIcon = icon ?? DEFAULT_ICON[tone] ?? '💡'
  return (
    <div className="px-6 py-6 mx-auto max-w-3xl">
      <div className={`rounded-xl border p-5 ${TONE_CLASS[tone] ?? TONE_CLASS.info}`}>
        <div className="flex items-start gap-4">
          <span aria-hidden className="text-2xl leading-none mt-0.5">{finalIcon}</span>
          <div className="flex-1">
            <h3 className="mb-1 text-base font-semibold">{heading}</h3>
            <p className="text-sm leading-relaxed opacity-90">{body}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
