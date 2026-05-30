export type ProfileAvatarEditorProps = {
  currentAvatarUrl?: string
  userName: string
  uploadLabel?: string
  removeLabel?: string
}
export function ProfileAvatarEditor({ currentAvatarUrl, userName, uploadLabel = 'Upload new photo', removeLabel = 'Remove' }: ProfileAvatarEditorProps) {
  return (
    <section className="px-6 py-8">
      <div className="mx-auto flex max-w-2xl items-center gap-6 rounded-xl border border-border bg-surface-raised p-6">
        {currentAvatarUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={currentAvatarUrl} alt="" className="h-24 w-24 rounded-full object-cover" />
        ) : (
          <span className="grid h-24 w-24 place-items-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">{userName.charAt(0).toUpperCase()}</span>
        )}
        <div className="flex-1">
          <h3 className="mb-1 text-base font-semibold text-foreground">Profile photo</h3>
          <p className="mb-3 text-xs text-muted-foreground">PNG, JPG, GIF · max 5 MB · 200×200 minimum</p>
          <div className="flex gap-2">
            <label className="cursor-pointer rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
              {uploadLabel}
              <input type="file" accept="image/*" className="hidden" />
            </label>
            <button type="button" className="rounded-md border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-surface-overlay">{removeLabel}</button>
          </div>
        </div>
      </div>
    </section>
  )
}
