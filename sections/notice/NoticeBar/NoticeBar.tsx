export type NoticeTone = 'info' | 'success' | 'warning' | 'error'

export type NoticeBarProps = {
  tone?: NoticeTone
  title?: string
  message: string
}

const ICONS: Record<NoticeTone, string> = {
  info: 'ℹ️',
  success: '✓',
  warning: '⚠',
  error: '✕',
}

const TONE_CLASSES: Record<NoticeTone, string> = {
  info: 'bg-blue-50 border-blue-300 text-blue-900',
  success: 'bg-emerald-50 border-emerald-300 text-emerald-900',
  warning: 'bg-amber-50 border-amber-300 text-amber-900',
  error: 'bg-red-50 border-red-300 text-red-900',
}

export function NoticeBar({ tone = 'info', title, message }: NoticeBarProps) {
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-md border-l-4 px-4 py-3 text-sm ${TONE_CLASSES[tone]}`}
    >
      <span aria-hidden="true" className="text-base">
        {ICONS[tone]}
      </span>
      <div>
        {title ? <p className="font-semibold">{title}</p> : null}
        <p>{message}</p>
      </div>
    </div>
  )
}
