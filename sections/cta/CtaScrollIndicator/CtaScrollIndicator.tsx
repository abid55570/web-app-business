export type CtaScrollIndicatorProps = {
  label?: string
  targetId: string
}

/**
 * Bouncing scroll-down indicator — anchor link to next section.
 * Useful below a full-bleed hero to prompt scroll.
 */
export function CtaScrollIndicator({
  label = 'Scroll for more',
  targetId,
}: CtaScrollIndicatorProps) {
  return (
    <div className="grid place-items-center px-6 py-8">
      <a
        href={`#${targetId}`}
        className="flex flex-col items-center gap-1 text-xs font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground"
      >
        <span>{label}</span>
        <span
          aria-hidden
          className="text-2xl"
          style={{ animation: 'cta-scroll-bounce 1.5s ease-in-out infinite' }}
        >
          ↓
        </span>
      </a>
      <style>{`@keyframes cta-scroll-bounce {
        0%,100% { transform: translateY(0); }
        50%     { transform: translateY(6px); }
      }`}</style>
    </div>
  )
}
