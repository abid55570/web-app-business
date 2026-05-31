/**
 * Onboarding state — tracks whether the user has been through the
 * welcome → template → brand funnel. localStorage-backed.
 */
const KEY = 'studio-onboarding-completed'
const BRAND_KEY = 'studio-onboarding-brand'

export type OnboardingBrand = {
  appName: string
  tagline?: string
  brandColor?: string
}

export function hasCompletedOnboarding(): boolean {
  if (typeof window === 'undefined') return true
  return window.localStorage.getItem(KEY) === 'true'
}

export function markOnboardingComplete(): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(KEY, 'true')
}

export function resetOnboarding(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(KEY)
  window.localStorage.removeItem(BRAND_KEY)
}

export function saveBrand(b: OnboardingBrand): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(BRAND_KEY, JSON.stringify(b))
}

export function loadBrand(): OnboardingBrand | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(BRAND_KEY)
    return raw ? (JSON.parse(raw) as OnboardingBrand) : null
  } catch {
    return null
  }
}
