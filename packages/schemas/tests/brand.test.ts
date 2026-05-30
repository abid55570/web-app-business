import { describe, expect, it } from 'vitest'
import { BrandSeedSchema, generateScale, getFontPair, FONT_PAIRS } from '../src/index.js'


describe('BrandSeedSchema', () => {
  it('accepts a 6-digit hex string', () => {
    expect(BrandSeedSchema.parse({ seed: '#22c55e' }).seed).toBe('#22c55e')
  })

  it('rejects 3-digit hex', () => {
    expect(() => BrandSeedSchema.parse({ seed: '#fff' })).toThrow()
  })

  it('rejects strings without #', () => {
    expect(() => BrandSeedSchema.parse({ seed: '22c55e' })).toThrow()
  })

  it('rejects non-hex chars', () => {
    expect(() => BrandSeedSchema.parse({ seed: '#zzzzzz' })).toThrow()
  })
})


describe('generateScale', () => {
  it('produces 50..950 stops with hex strings', () => {
    const scale = generateScale('#22c55e')
    const keys = Object.keys(scale)
    expect(keys).toEqual([
      '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950',
    ])
    for (const v of Object.values(scale)) {
      expect(v).toMatch(/^#[0-9a-f]{6}$/)
    }
  })

  it('500 stays close in hue to the seed (palette anchor)', () => {
    // Seed is a saturated green; 500 should be a green too — quick gut check
    // by inspecting the green channel beats red + blue at the anchor stop.
    const scale = generateScale('#22c55e')
    const r = parseInt(scale['500'].slice(1, 3), 16)
    const g = parseInt(scale['500'].slice(3, 5), 16)
    const b = parseInt(scale['500'].slice(5, 7), 16)
    expect(g).toBeGreaterThan(r)
    expect(g).toBeGreaterThan(b)
  })

  it('50 is much lighter than 950 (luminance monotonic)', () => {
    const scale = generateScale('#22c55e')
    const lum = (hex: string): number => {
      const [r, g, b] = [1, 3, 5].map((i) =>
        parseInt(hex.slice(i, i + 2), 16) / 255,
      )
      return 0.299 * r + 0.587 * g + 0.114 * b
    }
    expect(lum(scale['50'])).toBeGreaterThan(lum(scale['950']) + 0.5)
  })

  it('throws on invalid hex', () => {
    expect(() => generateScale('not-a-hex')).toThrow(/Invalid hex/)
  })
})


describe('font pair registry', () => {
  it('returns triple {head, body, mono} for known id', () => {
    const pair = getFontPair('inter-jetbrains-mono')
    expect(pair?.head[0]).toBe('Inter')
    expect(pair?.mono[0]).toBe('JetBrains Mono')
  })

  it('returns null for unknown id', () => {
    expect(getFontPair('comic-sans-please')).toBeNull()
  })

  it('every registered pair has all three slots', () => {
    for (const [, p] of Object.entries(FONT_PAIRS)) {
      expect(p.head.length).toBeGreaterThan(0)
      expect(p.body.length).toBeGreaterThan(0)
      expect(p.mono.length).toBeGreaterThan(0)
    }
  })
})
