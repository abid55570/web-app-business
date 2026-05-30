export type CodeInputProps = {
  name: string
  label: string
  length?: number
  helper?: string
}

export function CodeInput({
  name,
  label,
  length = 6,
  helper,
}: CodeInputProps) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-foreground">
        {label}
      </legend>
      <div className="flex gap-2">
        {Array.from({ length }).map((_, i) => (
          <input
            key={i}
            type="text"
            name={`${name}_${i}`}
            inputMode="numeric"
            maxLength={1}
            pattern="[0-9A-Za-z]"
            autoComplete="one-time-code"
            required
            className="h-12 w-12 rounded-lg border-2 border-border bg-background text-center font-mono text-xl font-bold text-foreground uppercase focus:border-primary focus:outline-none"
          />
        ))}
      </div>
      {helper ? (
        <p className="mt-2 text-xs text-muted-foreground">{helper}</p>
      ) : null}
    </fieldset>
  )
}
