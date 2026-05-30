export type StepperStep = {
  label: string
  description?: string
}

export type StepperProps = {
  steps: StepperStep[]
  currentStep: number
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <ol className="flex w-full items-start gap-2">
      {steps.map((step, i) => {
        const isDone = i < currentStep
        const isCurrent = i === currentStep
        const isFuture = i > currentStep
        return (
          <li key={i} className="flex flex-1 flex-col items-center text-center">
            <div className="relative flex w-full items-center">
              {i > 0 ? (
                <span
                  aria-hidden
                  className={`absolute left-0 right-1/2 h-0.5 ${
                    isDone || isCurrent ? 'bg-primary' : 'bg-border'
                  }`}
                />
              ) : null}
              <span
                aria-hidden
                className={`relative z-10 mx-auto grid h-8 w-8 place-items-center rounded-full text-sm font-semibold ${
                  isDone
                    ? 'bg-primary text-primary-foreground'
                    : isCurrent
                      ? 'border-2 border-primary bg-surface-raised text-primary'
                      : 'border border-border bg-surface-raised text-muted-foreground'
                }`}
              >
                {isDone ? '✓' : i + 1}
              </span>
              {i < steps.length - 1 ? (
                <span
                  aria-hidden
                  className={`absolute left-1/2 right-0 h-0.5 ${
                    isDone ? 'bg-primary' : 'bg-border'
                  }`}
                />
              ) : null}
            </div>
            <p
              className={`mt-2 text-xs font-semibold ${
                isFuture ? 'text-muted-foreground' : 'text-foreground'
              }`}
            >
              {step.label}
            </p>
            {step.description ? (
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {step.description}
              </p>
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
