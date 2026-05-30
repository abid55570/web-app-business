export type SignaturePadProps = {
  name: string
  label: string
  typedFallbackLabel?: string
  required?: boolean
  helper?: string
}

export function SignaturePad({
  name,
  label,
  typedFallbackLabel = 'Or type your name',
  required = false,
  helper,
}: SignaturePadProps) {
  return (
    <fieldset>
      <legend className="mb-1 text-sm font-semibold text-foreground">
        {label}
        {required ? <span className="ml-1 text-red-600">*</span> : null}
      </legend>
      <div
        aria-label="Signature drawing area"
        className="grid h-32 w-full place-items-center rounded-md border-2 border-dashed border-border bg-surface-sunken text-sm text-muted-foreground"
      >
        Draw signature (canvas wires up client-side)
      </div>
      <label
        htmlFor={`${name}-typed`}
        className="mt-3 block text-xs font-medium text-muted-foreground"
      >
        {typedFallbackLabel}
      </label>
      <input
        id={`${name}-typed`}
        type="text"
        name={name}
        required={required}
        autoComplete="off"
        className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 font-serif text-lg italic text-foreground focus:border-primary focus:outline-none"
      />
      {helper ? (
        <p className="mt-2 text-xs text-muted-foreground">{helper}</p>
      ) : null}
    </fieldset>
  )
}
