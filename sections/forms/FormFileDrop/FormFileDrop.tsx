export type FormFileDropProps = {
  label?: string
  name?: string
  accept?: string
  multiple?: boolean
  helpText?: string
}

export function FormFileDrop({
  label = 'Upload files',
  name = 'files',
  accept,
  multiple = true,
  helpText = 'Drag-and-drop or click to browse',
}: FormFileDropProps) {
  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-md">
        <label
          htmlFor={name}
          className="mb-2 block text-sm font-medium text-foreground"
        >
          {label}
        </label>
        <label
          htmlFor={name}
          className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface-raised text-center transition-colors hover:border-primary hover:bg-surface-overlay"
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="mb-2 text-muted-foreground"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
          <p className="text-sm font-medium text-foreground">{helpText}</p>
        </label>
        <input
          id={name}
          name={name}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
        />
      </div>
    </section>
  )
}
