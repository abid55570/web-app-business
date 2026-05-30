export type AddressFormProps = {
  name: string
  action: string
  countries: Array<{ code: string; label: string }>
  defaults?: {
    line1?: string
    line2?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
}

export function AddressForm({
  name,
  action,
  countries,
  defaults = {},
}: AddressFormProps) {
  const field = (k: string) => `${name}_${k}`
  return (
    <form action={action} method="POST" className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-foreground">
          Address line 1 <span className="text-red-600">*</span>
        </span>
        <input
          name={field('line1')}
          required
          defaultValue={defaults.line1}
          className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-foreground">
          Address line 2
        </span>
        <input
          name={field('line2')}
          defaultValue={defaults.line2}
          className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-foreground">
            City <span className="text-red-600">*</span>
          </span>
          <input
            name={field('city')}
            required
            defaultValue={defaults.city}
            className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-foreground">
            State / region
          </span>
          <input
            name={field('state')}
            defaultValue={defaults.state}
            className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-foreground">
            Postal code <span className="text-red-600">*</span>
          </span>
          <input
            name={field('postalCode')}
            required
            defaultValue={defaults.postalCode}
            className="block w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground focus:border-primary focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-foreground">
            Country <span className="text-red-600">*</span>
          </span>
          <select
            name={field('country')}
            required
            defaultValue={defaults.country}
            className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
          >
            <option value="">— select —</option>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button
        type="submit"
        className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
      >
        Save address
      </button>
    </form>
  )
}
