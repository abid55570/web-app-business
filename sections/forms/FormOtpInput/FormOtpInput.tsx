export type FormOtpInputProps = {
  label?: string
  name?: string
  length?: number
  helpText?: string
}

export function FormOtpInput({
  label = 'Enter verification code',
  name = 'otp',
  length = 6,
  helpText,
}: FormOtpInputProps) {
  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-md text-center">
        <label className="mb-3 block text-sm font-medium text-foreground">
          {label}
        </label>
        <div className="flex justify-center gap-2">
          {Array.from({ length }).map((_, i) => (
            <input
              key={i}
              type="text"
              inputMode="numeric"
              maxLength={1}
              name={`${name}-${i}`}
              className="h-12 w-12 rounded-lg border border-border bg-surface-raised text-center text-xl font-mono font-bold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          ))}
        </div>
        {helpText ? (
          <p className="mt-3 text-xs text-muted-foreground">{helpText}</p>
        ) : null}
      </div>
    </section>
  )
}
