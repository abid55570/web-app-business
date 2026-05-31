/**
 * In-app guided tour — types + storage helpers.
 *
 * Renders a spotlight overlay around a target element, a tooltip card
 * with title + body + nav buttons, and validates the user performed
 * the expected action before letting them advance.
 *
 * First-run detection: when localStorage 'studio-tour-completed' is
 * absent, the tour auto-runs once on Studio open. Users can re-run any
 * time via the "Take the tour" button in the top bar.
 */

const STORAGE_KEY = 'studio-tour-completed'
const PROGRESS_KEY = 'studio-tour-progress'

export type TourPlacement = 'top' | 'bottom' | 'left' | 'right' | 'center'

export type TourStep = {
  id: string
  title: string
  body: string
  /** CSS selector for the element to spotlight. `null` = no spotlight (centered modal). */
  target: string | null
  /** Where to place the tooltip relative to target. */
  placement?: TourPlacement
  /** Optional action label — when set, replaces "Next" with this. */
  ctaLabel?: string
  /** When true, user must perform an action before Next becomes enabled.
   *  The action is detected via a CSS selector or an event. */
  waitFor?: {
    /** Either a DOM mutation (e.g. canvas now has a block) or a click on `target`. */
    type: 'dom' | 'click'
    /** For 'dom': selector that should appear/exist after action. */
    selector?: string
  }
  /** Optional callback after step completes. */
  onComplete?: () => void
}

export function hasCompletedTour(): boolean {
  if (typeof window === 'undefined') return true
  return window.localStorage.getItem(STORAGE_KEY) === 'true'
}

export function markTourCompleted(): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, 'true')
  window.localStorage.removeItem(PROGRESS_KEY)
}

export function resetTour(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
  window.localStorage.removeItem(PROGRESS_KEY)
}

export function saveTourProgress(stepIndex: number): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(PROGRESS_KEY, String(stepIndex))
}

export function loadTourProgress(): number {
  if (typeof window === 'undefined') return 0
  const raw = window.localStorage.getItem(PROGRESS_KEY)
  return raw ? parseInt(raw, 10) || 0 : 0
}
