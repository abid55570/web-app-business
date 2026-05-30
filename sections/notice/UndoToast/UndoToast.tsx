export type UndoToastProps = {
  message: string
  undoAction: string
  secondsLeft?: number
}

export function UndoToast({
  message,
  undoAction,
  secondsLeft,
}: UndoToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-auto fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-full border border-border bg-foreground px-5 py-3 text-sm text-background shadow-2xl"
    >
      <p className="font-medium">
        {message}
        {secondsLeft !== undefined ? (
          <span className="ml-2 text-xs opacity-70">
            (undo in {secondsLeft}s)
          </span>
        ) : null}
      </p>
      <form action={undoAction} method="POST">
        <button
          type="submit"
          className="text-xs font-bold uppercase tracking-wider text-primary hover:underline"
        >
          Undo
        </button>
      </form>
    </div>
  )
}
