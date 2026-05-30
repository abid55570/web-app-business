export type ProgressNoticeStep = {
  label: string
  done?: boolean
  current?: boolean
}

export type ProgressNoticeProps = {
  title: string
  percent: number
  steps?: ProgressNoticeStep[]
}

export function ProgressNotice({ title, percent, steps }: ProgressNoticeProps) {
  return (
    <div className="rounded-lg border border-border bg-surface-raised p-5">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-sm font-semibold text-primary">{percent}%</p>
      </div>
      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-surface-sunken"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span
          className="block h-full bg-primary transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      {steps?.length ? (
        <ol className="mt-4 space-y-1.5 text-sm">
          {steps.map((s, i) => (
            <li
              key={i}
              className={`flex items-center gap-2 ${
                s.done
                  ? 'text-muted-foreground line-through'
                  : s.current
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground'
              }`}
            >
              <span
                aria-hidden
                className={`grid h-4 w-4 place-items-center rounded-full text-[10px] ${
                  s.done
                    ? 'bg-primary text-primary-foreground'
                    : s.current
                      ? 'border-2 border-primary'
                      : 'border border-border'
                }`}
              >
                {s.done ? '✓' : ''}
              </span>
              {s.label}
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  )
}
