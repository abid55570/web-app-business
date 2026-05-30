export type FileUploadProps = {
  label?: string
  hint?: string
  accept?: string
  action: string
  multiple?: boolean
}

export function FileUpload({
  label = 'Upload a file',
  hint = 'Drag a file here, or click to browse.',
  accept = '*/*',
  action,
  multiple = false,
}: FileUploadProps) {
  return (
    <section className="px-6 py-10 lg:px-12">
      <form
        action={action}
        method="POST"
        encType="multipart/form-data"
        className="mx-auto max-w-xl"
      >
        <label
          htmlFor="b-dash-upload"
          className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-surface-raised px-6 py-12 text-center hover:border-primary hover:bg-accent"
        >
          <span className="text-4xl" aria-hidden="true">
            ⬆
          </span>
          <span className="text-base font-semibold text-foreground">
            {label}
          </span>
          <span className="text-sm text-muted-foreground">{hint}</span>
        </label>
        <input
          id="b-dash-upload"
          name={multiple ? 'files' : 'file'}
          type="file"
          accept={accept}
          multiple={multiple}
          required
          className="sr-only"
        />
        <button
          type="submit"
          className="mt-4 w-full rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Upload
        </button>
      </form>
    </section>
  )
}
