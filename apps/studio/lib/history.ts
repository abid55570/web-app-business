/**
 * Bounded undo/redo history for the studio.
 *
 * Each entry stores (action label, snapshot). The history is capped at
 * MAX_HISTORY entries — older entries fall off the back. Push truncates
 * the redo tail when invoked mid-history (standard undo-tree behaviour).
 */
export const MAX_HISTORY = 200

export type HistoryEntry<T> = {
  action: string
  snapshot: T
  at: number
}

export type History<T> = {
  past: HistoryEntry<T>[]
  present: HistoryEntry<T>
  future: HistoryEntry<T>[]
}

export function initHistory<T>(snapshot: T, action = 'init'): History<T> {
  return { past: [], present: { action, snapshot, at: 0 }, future: [] }
}

export function pushHistory<T>(
  h: History<T>,
  snapshot: T,
  action: string,
): History<T> {
  const past = [...h.past, h.present].slice(-MAX_HISTORY)
  return { past, present: { action, snapshot, at: past.length }, future: [] }
}

export function undo<T>(h: History<T>): History<T> {
  if (h.past.length === 0) return h
  const prev = h.past[h.past.length - 1]
  return {
    past: h.past.slice(0, -1),
    present: prev,
    future: [h.present, ...h.future],
  }
}

export function redo<T>(h: History<T>): History<T> {
  if (h.future.length === 0) return h
  const [next, ...rest] = h.future
  return { past: [...h.past, h.present], present: next, future: rest }
}

export function canUndo<T>(h: History<T>): boolean {
  return h.past.length > 0
}

export function canRedo<T>(h: History<T>): boolean {
  return h.future.length > 0
}
