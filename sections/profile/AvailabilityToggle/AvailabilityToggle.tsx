export type AvailabilityToggleProps = {
  name?: string
  status: 'online' | 'busy' | 'away' | 'offline'
  action: string
}

const OPTIONS: Array<{
  value: AvailabilityToggleProps['status']
  label: string
  color: string
}> = [
  { value: 'online', label: 'Online', color: 'bg-emerald-500' },
  { value: 'busy', label: 'Busy', color: 'bg-red-500' },
  { value: 'away', label: 'Away', color: 'bg-amber-500' },
  { value: 'offline', label: 'Offline', color: 'bg-muted-foreground/40' },
]

export function AvailabilityToggle({
  name = 'status',
  status,
  action,
}: AvailabilityToggleProps) {
  return (
    <form action={action} method="POST" className="inline-block">
      <fieldset className="inline-flex rounded-full bg-surface-sunken p-1">
        <legend className="sr-only">Availability status</legend>
        {OPTIONS.map((opt) => {
          const id = `b-dash-availability-${opt.value}`
          return (
            <span key={opt.value} className="contents">
              <input
                type="radio"
                id={id}
                name={name}
                value={opt.value}
                defaultChecked={status === opt.value}
                className="peer/s sr-only"
                onChange={() => {}}
              />
              <label
                htmlFor={id}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-muted-foreground peer-checked/s:bg-surface-raised peer-checked/s:text-foreground peer-checked/s:shadow-sm"
              >
                <span aria-hidden className={`h-2 w-2 rounded-full ${opt.color}`} />
                {opt.label}
              </label>
            </span>
          )
        })}
      </fieldset>
      <button type="submit" className="sr-only">
        Update status
      </button>
    </form>
  )
}
