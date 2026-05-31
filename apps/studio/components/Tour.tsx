'use client'
import { useEffect, useRef, useState } from 'react'
import type { TourStep } from '../lib/tour'
import { markTourCompleted, saveTourProgress } from '../lib/tour'

type Rect = { top: number; left: number; width: number; height: number }

export function Tour({
  steps,
  initialIndex,
  onClose,
}: {
  steps: TourStep[]
  initialIndex: number
  onClose: () => void
}) {
  const [stepIdx, setStepIdx] = useState(initialIndex)
  const [targetRect, setTargetRect] = useState<Rect | null>(null)
  const [waitSatisfied, setWaitSatisfied] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const step = steps[stepIdx]

  // Measure the target element + watch for resize/scroll.
  useEffect(() => {
    saveTourProgress(stepIdx)
    setWaitSatisfied(!step?.waitFor)
    if (!step?.target) {
      setTargetRect(null)
      return
    }
    function measure() {
      const el = document.querySelector(step!.target!)
      if (!el) {
        setTargetRect(null)
        return
      }
      const r = el.getBoundingClientRect()
      setTargetRect({ top: r.top, left: r.left, width: r.width, height: r.height })
    }
    measure()
    const obs = new ResizeObserver(measure)
    obs.observe(document.body)
    window.addEventListener('scroll', measure, true)
    window.addEventListener('resize', measure)
    return () => {
      obs.disconnect()
      window.removeEventListener('scroll', measure, true)
      window.removeEventListener('resize', measure)
    }
  }, [stepIdx, step])

  // Watch for waitFor condition (DOM-based).
  useEffect(() => {
    if (!step?.waitFor || step.waitFor.type !== 'dom' || !step.waitFor.selector) return
    function check() {
      const el = document.querySelector(step!.waitFor!.selector!)
      if (el) setWaitSatisfied(true)
    }
    check()
    const obs = new MutationObserver(check)
    obs.observe(document.body, { childList: true, subtree: true })
    return () => obs.disconnect()
  }, [step])

  function next() {
    if (stepIdx >= steps.length - 1) {
      markTourCompleted()
      onClose()
      return
    }
    setStepIdx((i) => i + 1)
  }

  function prev() {
    setStepIdx((i) => Math.max(0, i - 1))
  }

  function skip() {
    markTourCompleted()
    onClose()
  }

  if (!step) return null

  const placement = step.placement ?? 'bottom'
  const tooltipPos = computeTooltipPos(targetRect, placement)

  return (
    <div className="tour-root">
      {/* Backdrop with cutout */}
      <div
        className="tour-backdrop"
        style={
          targetRect
            ? {
                clipPath: `polygon(
                  0% 0%, 0% 100%,
                  ${targetRect.left - 6}px 100%,
                  ${targetRect.left - 6}px ${targetRect.top - 6}px,
                  ${targetRect.left + targetRect.width + 6}px ${targetRect.top - 6}px,
                  ${targetRect.left + targetRect.width + 6}px ${targetRect.top + targetRect.height + 6}px,
                  ${targetRect.left - 6}px ${targetRect.top + targetRect.height + 6}px,
                  ${targetRect.left - 6}px 100%,
                  100% 100%, 100% 0%
                )`,
              }
            : undefined
        }
      />
      {/* Spotlight border */}
      {targetRect ? (
        <div
          className="tour-spotlight"
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
        />
      ) : null}
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={`tour-tooltip tour-${placement}`}
        style={tooltipPos}
      >
        <div className="tour-hdr">
          <span className="tour-step-counter">
            Step {stepIdx + 1} of {steps.length}
          </span>
          <button type="button" className="tour-skip" onClick={skip}>
            Skip tour
          </button>
        </div>
        <h3 className="tour-title">{step.title}</h3>
        <p className="tour-body">{step.body}</p>
        <div className="tour-progress">
          <div
            className="tour-progress-fill"
            style={{ width: `${((stepIdx + 1) / steps.length) * 100}%` }}
          />
        </div>
        <div className="tour-actions">
          <button
            type="button"
            className="btn"
            onClick={prev}
            disabled={stepIdx === 0}
          >
            ← Back
          </button>
          <button
            type="button"
            className={`btn ${waitSatisfied ? 'btn-primary' : ''}`}
            onClick={next}
            disabled={!waitSatisfied}
          >
            {waitSatisfied
              ? step.ctaLabel ?? (stepIdx === steps.length - 1 ? 'Finish 🎉' : 'Next →')
              : step.ctaLabel ?? 'Waiting…'}
          </button>
        </div>
      </div>
    </div>
  )
}

function computeTooltipPos(
  rect: Rect | null,
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center',
): React.CSSProperties {
  const TOOLTIP_W = 360
  const TOOLTIP_H_EST = 240
  const PAD = 12
  if (!rect || placement === 'center') {
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    }
  }
  switch (placement) {
    case 'top':
      return {
        top: Math.max(PAD, rect.top - TOOLTIP_H_EST - PAD),
        left: clamp(rect.left + rect.width / 2 - TOOLTIP_W / 2, PAD, window.innerWidth - TOOLTIP_W - PAD),
      }
    case 'bottom':
      return {
        top: rect.top + rect.height + PAD,
        left: clamp(rect.left + rect.width / 2 - TOOLTIP_W / 2, PAD, window.innerWidth - TOOLTIP_W - PAD),
      }
    case 'left':
      return {
        top: clamp(rect.top + rect.height / 2 - TOOLTIP_H_EST / 2, PAD, window.innerHeight - TOOLTIP_H_EST - PAD),
        left: Math.max(PAD, rect.left - TOOLTIP_W - PAD),
      }
    case 'right':
      return {
        top: clamp(rect.top + rect.height / 2 - TOOLTIP_H_EST / 2, PAD, window.innerHeight - TOOLTIP_H_EST - PAD),
        left: rect.left + rect.width + PAD,
      }
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}
