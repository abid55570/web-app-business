/**
 * Brand ingestion — extract a usable color palette from a single seed
 * input (logo URL, hex string, or named color). Phase 5 ships a
 * deterministic algorithmic generator from a single seed hex; image
 * decoding (logo → dominant color via histogram) is operator-side.
 *
 * Output shape matches a tokens.json's ``colors.primary`` 50..950 scale
 * so the wirer can splice it into a theme's tokens at render time.
 */
import { z } from 'zod'

export const HEX_RE = /^#[0-9a-fA-F]{6}$/

export const BrandSeedSchema = z.object({
  /** Hex string like "#22c55e". Required if no logoPath given. */
  seed: z.string().regex(HEX_RE, 'must be a #RRGGBB hex string'),
  /** Optional human label for the brand color (Studio shows it). */
  label: z.string().optional(),
})

export type BrandSeed = z.infer<typeof BrandSeedSchema>


export type ColorScale = Record<string, string> // "50".."950" → hex


/**
 * Generate a Tailwind-style 50..950 scale from a single seed hex by
 * sliding luminance via OKLab-ish lightness mixing in HSL space.
 * Heuristic — good enough for a starting point; operator refines in
 * Studio's theme panel.
 *
 * Algorithm:
 *  1. Convert seed → HSL.
 *  2. For each step, override L with the canonical Tailwind L value
 *     for that stop, keeping H + S close to seed (S taper at extremes
 *     so 50 stays pastel, 950 stays inky).
 */
export function generateScale(seedHex: string): ColorScale {
  if (!HEX_RE.test(seedHex)) {
    throw new Error(`Invalid hex: ${seedHex}`)
  }
  const { h, s } = hexToHsl(seedHex)
  const stops: { stop: string; l: number; sScale: number }[] = [
    { stop: '50',  l: 97, sScale: 0.55 },
    { stop: '100', l: 94, sScale: 0.65 },
    { stop: '200', l: 86, sScale: 0.75 },
    { stop: '300', l: 76, sScale: 0.85 },
    { stop: '400', l: 64, sScale: 0.95 },
    { stop: '500', l: 53, sScale: 1.00 }, // anchor close to seed
    { stop: '600', l: 45, sScale: 0.95 },
    { stop: '700', l: 37, sScale: 0.85 },
    { stop: '800', l: 30, sScale: 0.75 },
    { stop: '900', l: 24, sScale: 0.65 },
    { stop: '950', l: 14, sScale: 0.55 },
  ]
  const out: ColorScale = {}
  for (const { stop, l, sScale } of stops) {
    out[stop] = hslToHex(h, Math.min(100, s * sScale), l)
  }
  return out
}


function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h *= 60
  }
  return { h, s: s * 100, l: l * 100 }
}


function hslToHex(h: number, s: number, l: number): string {
  const sN = s / 100
  const lN = l / 100
  const c = (1 - Math.abs(2 * lN - 1)) * sN
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = lN - c / 2
  let r = 0
  let g = 0
  let b = 0
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  const toHex = (v: number): string =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}


/** Curated font-pair registry — head font + body/mono pairing names that
 * the theme tokens.json `typography.fontPair` field references. Wirer maps
 * each id to actual font-family strings in the generated tailwind.config.ts. */
export const FONT_PAIRS = {
  'geist-jetbrains-mono': {
    head: ['Geist', 'system-ui', 'sans-serif'],
    body: ['Geist', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
  },
  'inter-jetbrains-mono': {
    head: ['Inter', 'system-ui', 'sans-serif'],
    body: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
  },
  'playfair-source-sans': {
    head: ['Playfair Display', 'Georgia', 'serif'],
    body: ['Source Sans 3', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
  },
  'space-grotesk-mono': {
    head: ['Space Grotesk', 'system-ui', 'sans-serif'],
    body: ['Space Grotesk', 'system-ui', 'sans-serif'],
    mono: ['Space Mono', 'ui-monospace', 'monospace'],
  },
  'fraunces-inter': {
    head: ['Fraunces', 'Georgia', 'serif'],
    body: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
  },
  'ibm-plex-serif-sans': {
    head: ['IBM Plex Serif', 'Georgia', 'serif'],
    body: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
    mono: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
  },
} as const

export type FontPairId = keyof typeof FONT_PAIRS


export function getFontPair(id: string):
  | (typeof FONT_PAIRS)[FontPairId]
  | null {
  return (FONT_PAIRS as Record<string, (typeof FONT_PAIRS)[FontPairId]>)[id]
    ?? null
}
