'use client'
import { useEffect, useState } from 'react'

export type AppFirstRunTourStep = {
  title: string
  body: string
  /** CSS selector for the target. Empty = centered modal. */
  targetSelector?: string
  ctaLabel?: string
}

export type AppFirstRunTourProps = {
  /** Tour identifier — used as localStorage key. Set this per-app. */
  tourId?: string
  appName: string
  steps: AppFirstRunTourStep[]
  /** Force-show even if previously dismissed. */
  forceShow?: boolean
}

/**
 * In-app first-run guided tour for a generated app.
 *
 * Drop into a generated app's layout. On first visit, shows a spotlight
 * tour walking new users through the app's core features. Dismissed
 * tours are remembered in localStorage so users only see it once
 * (unless `forceShow` is set or they click a "Take the tour" link).
 *
 * Each step targets a DOM element by CSS selector; spotlight + tooltip
 * highlight it. Plain-language guidance lets non-technical users learn
 * the app in 2-3 minutes.
 *
 * Pair with the `Take the tour` link in your nav for re-entry.
 */
export function AppFirstRunTour({
  tourId = 'app-tour-completed',
  appName,
  steps,
  forceShow = false,
}: AppFirstRunTourProps) {
  const [stepIdx, setStepIdx] = useState(0)
  const [open, setOpen] = useState(false)
  const [rect, setRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (forceShow || !window.localStorage.getItem(tourId)) {
      const t = setTimeout(() => setOpen(true), 800)
      return () => clearTimeout(t)
    }
  }, [tourId, forceShow])

  useEffect(() => {
    if (!open) return
    const step = steps[stepIdx]
    if (!step?.targetSelector) {
      setRect(null)
      return
    }
    function measure() {
      const el = document.querySelector(step.targetSelector!)
      if (!el) { setRect(null); return }
      const r = el.getBoundingClientRect()
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
    }
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [stepIdx, open, steps])

  function close() {
    if (typeof window !== 'undefined') window.localStorage.setItem(tourId, 'true')
    setOpen(false)
  }

  if (!open) return null
  const step = steps[stepIdx]
  if (!step) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${appName} tour`}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none' }}
    >
      <div
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15,23,42,.7)',
          pointerEvents: 'auto',
          clipPath: rect
            ? `polygon(
                0% 0%, 0% 100%,
                ${rect.left - 6}px 100%,
                ${rect.left - 6}px ${rect.top - 6}px,
                ${rect.left + rect.width + 6}px ${rect.top - 6}px,
                ${rect.left + rect.width + 6}px ${rect.top + rect.height + 6}px,
                ${rect.left - 6}px ${rect.top + rect.height + 6}px,
                ${rect.left - 6}px 100%,
                100% 100%, 100% 0%
              )`
            : undefined,
        }}
      />
      {rect ? (
        <div
          style={{
            position: 'fixed',
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            border: '3px solid #fbbf24',
            borderRadius: 10,
            boxShadow: '0 0 0 4px rgba(251,191,36,.25)',
            pointerEvents: 'none',
          }}
        />
      ) : null}
      <div
        style={{
          position: 'fixed',
          width: 360,
          maxWidth: 'calc(100vw - 32px)',
          background: '#fff',
          borderRadius: 12,
          padding: '18px 20px',
          boxShadow: '0 20px 60px rgba(0,0,0,.35)',
          pointerEvents: 'auto',
          ...(rect
            ? { top: Math.min(window.innerHeight - 260, rect.top + rect.height + 12), left: Math.max(16, Math.min(window.innerWidth - 376, rect.left)) }
            : { top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }),
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '.06em' }}>
            Step {stepIdx + 1} of {steps.length}
          </span>
          <button
            type="button"
            onClick={close}
            style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 10, color: '#71717a', textDecoration: 'underline' }}
          >
            Skip tour
          </button>
        </div>
        <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: '#18181b' }}>
          {step.title}
        </h3>
        <p style={{ margin: '0 0 14px', fontSize: 13, lineHeight: 1.55, color: '#3f3f46' }}>
          {step.body}
        </p>
        <div style={{ height: 4, background: '#e5e7eb', borderRadius: 2, overflow: 'hidden', marginBottom: 12 }}>
          <div
            style={{
              height: '100%',
              width: `${((stepIdx + 1) / steps.length) * 100}%`,
              background: 'linear-gradient(90deg, #6366f1, #ec4899)',
              transition: 'width 280ms ease',
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <button
            type="button"
            onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
            disabled={stepIdx === 0}
            style={{
              padding: '6px 12px', borderRadius: 6,
              border: '1px solid #d4d4d8', background: '#fff',
              cursor: stepIdx === 0 ? 'not-allowed' : 'pointer',
              opacity: stepIdx === 0 ? 0.4 : 1,
              fontSize: 12, fontWeight: 600,
            }}
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={() => {
              if (stepIdx >= steps.length - 1) close()
              else setStepIdx((i) => i + 1)
            }}
            style={{
              padding: '6px 12px', borderRadius: 6,
              border: '1px solid #6366f1', background: '#6366f1',
              color: '#fff', cursor: 'pointer',
              fontSize: 12, fontWeight: 600,
            }}
          >
            {step.ctaLabel ?? (stepIdx === steps.length - 1 ? `Get started with ${appName} →` : 'Next →')}
          </button>
        </div>
      </div>
    </div>
  )
}
