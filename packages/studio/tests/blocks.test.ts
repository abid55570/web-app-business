import { describe, expect, it } from 'vitest'
import type { Section } from '@b-dash/schemas'
import {
  buildAllBlockManifests,
  buildBlockManifest,
} from '../src/blocks.js'


const HERO: Section = {
  id: 'HeroSplit',
  displayName: 'Hero — split',
  description: 'Copy left, image right.',
  version: '1.0.0',
  category: 'hero',
  density: 'spacious',
  responsive: 'mobile-first',
  componentFile: './HeroSplit.tsx',
  props: {
    headline: {
      type: 'string',
      label: 'Headline',
      required: true,
      maxLength: 80,
    },
    body: {
      type: 'string',
      label: 'Body',
      multiline: true,
      required: true,
    },
    ctaLabel: {
      type: 'string',
      label: 'CTA label',
      default: 'Get started',
    },
    imageUrl: {
      type: 'image',
      label: 'Hero image',
    },
  },
  tags: [],
  bestWithThemes: [],
  deprecated: false,
}


describe('buildBlockManifest', () => {
  it('maps string + multiline → text + textarea', () => {
    const m = buildBlockManifest(HERO)
    expect(m.fields.headline?.type).toBe('text')
    expect(m.fields.body?.type).toBe('textarea')
  })

  it('carries label + required + description across', () => {
    const m = buildBlockManifest(HERO)
    expect(m.fields.headline?.label).toBe('Headline')
    expect(m.fields.headline?.required).toBe(true)
  })

  it('captures defaults into defaultProps', () => {
    const m = buildBlockManifest(HERO)
    expect(m.defaultProps.ctaLabel).toBe('Get started')
    // No default → not in defaultProps
    expect(m.defaultProps.headline).toBeUndefined()
  })

  it('image props map to text (URL field) until a real upload widget lands', () => {
    const m = buildBlockManifest(HERO)
    expect(m.fields.imageUrl?.type).toBe('text')
  })

  it('forwards id + category for the palette grouping', () => {
    const m = buildBlockManifest(HERO)
    expect(m.id).toBe('HeroSplit')
    expect(m.category).toBe('hero')
    expect(m.displayName).toBe('Hero — split')
  })

  it('threads maxLength → max', () => {
    const m = buildBlockManifest(HERO)
    expect(m.fields.headline?.max).toBe(80)
  })
})


describe('buildAllBlockManifests', () => {
  it('accepts both raw sections and LoadedSection-shaped wrappers', () => {
    const raw = buildAllBlockManifests([HERO])
    const wrapped = buildAllBlockManifests([{ manifest: HERO }])
    expect(raw).toEqual(wrapped)
    expect(raw[0]?.id).toBe('HeroSplit')
  })

  it('returns one manifest per section', () => {
    const manifests = buildAllBlockManifests([HERO, { ...HERO, id: 'HeroSplit2' }])
    expect(manifests.map((m) => m.id)).toEqual(['HeroSplit', 'HeroSplit2'])
  })
})
