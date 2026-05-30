export type TwoFactorSetupProps = {
  qrCodeImageUrl: string
  manualSecret: string
  action: string
  helpHref?: string
}

export function TwoFactorSetup({
  qrCodeImageUrl,
  manualSecret,
  action,
  helpHref,
}: TwoFactorSetupProps) {
  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-border bg-surface-raised p-6">
      <h2 className="text-lg font-semibold text-foreground">
        Set up two-factor authentication
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Scan the QR with your authenticator app (Google Authenticator, 1Password,
        Authy…) then enter the 6-digit code below to confirm.
      </p>
      <div className="mt-5 grid items-center gap-5 sm:grid-cols-[180px_1fr]">
        <div className="rounded-lg border border-border bg-white p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrCodeImageUrl}
            alt="2FA QR code"
            className="h-full w-full"
          />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Or enter manually
          </p>
          <p
            className="mt-2 break-all rounded-md bg-surface-sunken px-3 py-2 font-mono text-sm text-foreground"
          >
            {manualSecret}
          </p>
        </div>
      </div>
      <form action={action} method="POST" className="mt-5 flex gap-2">
        <label htmlFor="b-dash-tfa-code" className="sr-only">
          6-digit code
        </label>
        <input
          id="b-dash-tfa-code"
          type="text"
          name="code"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          autoComplete="one-time-code"
          placeholder="123 456"
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-center font-mono text-lg text-foreground tracking-widest focus:border-primary focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Verify + enable
        </button>
      </form>
      {helpHref ? (
        <p className="mt-4 text-xs text-muted-foreground">
          Need help? <a href={helpHref} className="text-primary hover:underline">Read the 2FA guide →</a>
        </p>
      ) : null}
    </section>
  )
}
