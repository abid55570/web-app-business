export type AvatarUploadProps = {
  action: string
  currentAvatarUrl?: string
  fallbackInitial?: string
  removeAction?: string
}

export function AvatarUpload({
  action,
  currentAvatarUrl,
  fallbackInitial = '?',
  removeAction,
}: AvatarUploadProps) {
  return (
    <form action={action} method="POST" encType="multipart/form-data" className="flex items-center gap-5">
      <span className="block h-20 w-20 overflow-hidden rounded-full border border-border bg-surface-sunken">
        {currentAvatarUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={currentAvatarUrl}
            alt="Current avatar"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="grid h-full w-full place-items-center bg-primary text-2xl font-bold text-primary-foreground">
            {fallbackInitial.toUpperCase()}
          </span>
        )}
      </span>
      <div className="flex-1">
        <label htmlFor="b-dash-avatar-file" className="inline-block cursor-pointer rounded-md border border-border bg-surface-raised px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent">
          Choose photo
          <input
            id="b-dash-avatar-file"
            name="avatar"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
          />
        </label>
        <p className="mt-1 text-xs text-muted-foreground">
          PNG, JPEG, WebP. Max 2 MB.
        </p>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Save
        </button>
        {removeAction && currentAvatarUrl ? (
          <button
            type="submit"
            formAction={removeAction}
            className="rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            Remove
          </button>
        ) : null}
      </div>
    </form>
  )
}
