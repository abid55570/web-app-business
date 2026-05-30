export type OtpInputProps = {
  heading?: string
  body?: string
  action: string
  resendHref?: string
}

export function OtpInput({
  heading = 'Enter the 6-digit code',
  body,
  action,
  resendHref,
}: OtpInputProps) {
  return (
    <section className="px-6 py-12 lg:px-12">
      <form
        action={action}
        method="POST"
        className="mx-auto max-w-md rounded-xl border border-border bg-surface-raised p-8 text-center"
      >
        <h2 className="mb-2 text-xl font-bold text-foreground">{heading}</h2>
        {body ? (
          <p className="mb-6 text-sm text-muted-foreground">{body}</p>
        ) : null}
        <div className="mb-6 flex justify-center gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <input
              key={i}
              name={`d${i}`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]"
              maxLength={1}
              required
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              aria-label={`Digit ${i + 1} of 6`}
              className="h-12 w-12 rounded-md border border-border bg-background text-center text-lg font-semibold text-foreground"
            />
          ))}
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Verify
        </button>
        {resendHref ? (
          <p className="mt-4 text-xs text-muted-foreground">
            Didn't get the code?{' '}
            <a href={resendHref} className="text-primary hover:underline">
              Resend
            </a>
          </p>
        ) : null}
      </form>
    </section>
  )
}
