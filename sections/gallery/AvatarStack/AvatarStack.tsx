export type AvatarItem = {
  src: string
  alt: string
}

export type AvatarStackProps = {
  avatars: AvatarItem[]
  max?: number
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_CLASS: Record<NonNullable<AvatarStackProps['size']>, string> = {
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-12 w-12 text-sm',
}

export function AvatarStack({
  avatars,
  max = 5,
  size = 'md',
}: AvatarStackProps) {
  const visible = avatars.slice(0, max)
  const remaining = Math.max(0, avatars.length - max)
  return (
    <ul className="flex -space-x-2">
      {visible.map((a, i) => (
        <li
          key={i}
          className={`overflow-hidden rounded-full ring-2 ring-background ${SIZE_CLASS[size]}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={a.src}
            alt={a.alt}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </li>
      ))}
      {remaining > 0 ? (
        <li
          aria-label={`${remaining} more`}
          className={`flex items-center justify-center rounded-full bg-surface-overlay font-semibold text-foreground ring-2 ring-background ${SIZE_CLASS[size]}`}
        >
          +{remaining}
        </li>
      ) : null}
    </ul>
  )
}
