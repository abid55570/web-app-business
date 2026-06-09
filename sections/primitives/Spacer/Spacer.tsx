export type SpacerProps = {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
}

const SIZE_CLASS: Record<string, string> = {
  xs:   'h-4',     // 16px
  sm:   'h-8',     // 32px
  md:   'h-12',    // 48px
  lg:   'h-20',    // 80px
  xl:   'h-32',    // 128px
  '2xl': 'h-40',   // 160px
  '3xl': 'h-56',   // 224px
  '4xl': 'h-72',   // 288px
}

export function Spacer({ size = 'lg' }: SpacerProps) {
  return <div aria-hidden className={SIZE_CLASS[size] ?? SIZE_CLASS.lg} />
}
