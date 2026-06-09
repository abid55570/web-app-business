export type TagRowProps = {
  tags: string[]
  variant?: 'subtle' | 'outline' | 'solid'
}

const VARIANT_CLASS: Record<string, string> = {
  subtle:  'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-transparent',
  outline: 'bg-transparent border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200',
  solid:   'bg-primary text-primary-foreground border-transparent',
}

export function TagRow({ tags, variant = 'subtle' }: TagRowProps) {
  return (
    <div className="px-6 py-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {tags.map((tag, i) => (
          <span
            key={i}
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${VARIANT_CLASS[variant] ?? VARIANT_CLASS.subtle}`}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}
