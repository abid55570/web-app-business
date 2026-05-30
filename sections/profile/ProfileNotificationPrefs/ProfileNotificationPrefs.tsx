export type ProfileNotificationPrefsChannel = {
  id: string
  label: string
  description?: string
  email?: boolean
  push?: boolean
  sms?: boolean
}

export type ProfileNotificationPrefsProps = {
  heading?: string
  channels: ProfileNotificationPrefsChannel[]
}

export function ProfileNotificationPrefs({
  heading = 'Notification preferences',
  channels,
}: ProfileNotificationPrefsProps) {
  return (
    <section className="px-6 py-8">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-6 text-xl font-semibold text-foreground">{heading}</h2>
        <div className="overflow-hidden rounded-xl border border-border bg-surface-raised">
          <table className="w-full text-sm">
            <thead className="bg-surface-overlay">
              <tr>
                <th className="p-3 text-left text-xs font-bold uppercase text-muted-foreground">
                  Topic
                </th>
                <th className="p-3 text-center text-xs font-bold uppercase text-muted-foreground">
                  Email
                </th>
                <th className="p-3 text-center text-xs font-bold uppercase text-muted-foreground">
                  Push
                </th>
                <th className="p-3 text-center text-xs font-bold uppercase text-muted-foreground">
                  SMS
                </th>
              </tr>
            </thead>
            <tbody>
              {channels.map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="p-3">
                    <p className="font-medium text-foreground">{c.label}</p>
                    {c.description ? (
                      <p className="text-xs text-muted-foreground">
                        {c.description}
                      </p>
                    ) : null}
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      name={`${c.id}-email`}
                      defaultChecked={c.email}
                      className="h-4 w-4 accent-primary"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      name={`${c.id}-push`}
                      defaultChecked={c.push}
                      className="h-4 w-4 accent-primary"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      name={`${c.id}-sms`}
                      defaultChecked={c.sms}
                      className="h-4 w-4 accent-primary"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
