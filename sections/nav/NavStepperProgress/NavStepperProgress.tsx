export type NavStepperProgressStep = {
  label: string
}

export type NavStepperProgressProps = {
  steps: NavStepperProgressStep[]
  currentIndex: number
}

export function NavStepperProgress({
  steps,
  currentIndex,
}: NavStepperProgressProps) {
  return (
    <nav className="px-6 py-6" aria-label="Progress">
      <ol className="mx-auto flex max-w-3xl items-center gap-2">
        {steps.map((s, i) => {
          const done = i < currentIndex
          const active = i === currentIndex
          return (
            <li key={i} className="flex flex-1 items-center gap-2">
              <span
                className={
                  done
                    ? 'grid h-7 w-7 flex-shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground'
                    : active
                    ? 'grid h-7 w-7 flex-shrink-0 place-items-center rounded-full border-2 border-primary text-xs font-bold text-primary'
                    : 'grid h-7 w-7 flex-shrink-0 place-items-center rounded-full border-2 border-border text-xs font-bold text-muted-foreground'
                }
              >
                {done ? '✓' : i + 1}
              </span>
              <span
                className={
                  active
                    ? 'text-sm font-semibold text-foreground'
                    : 'text-xs text-muted-foreground'
                }
              >
                {s.label}
              </span>
              {i < steps.length - 1 ? (
                <span
                  className={`mx-2 h-px flex-1 ${
                    done ? 'bg-primary' : 'bg-border'
                  }`}
                />
              ) : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
