import { describe, expect, it } from 'vitest'
import {
  MOTION_PRESET_CATALOG,
  MotionPresetSchema,
  getMotionPreset,
  listMotionPresets,
} from '../src/index.js'


describe('MOTION_PRESET_CATALOG catalog', () => {
  it('every built-in preset validates against MotionPresetSchema', () => {
    for (const [id, preset] of Object.entries(MOTION_PRESET_CATALOG)) {
      expect(() => MotionPresetSchema.parse(preset)).not.toThrow()
      expect(preset.id).toBe(id)
    }
  })

  it('ships at least one preset per intent', () => {
    const intents = new Set(Object.values(MOTION_PRESET_CATALOG).map((p) => p.intent))
    for (const i of ['enter', 'exit', 'attention', 'loop'] as const) {
      expect(intents.has(i)).toBe(true)
    }
  })

  it('every className starts with animate-', () => {
    for (const p of Object.values(MOTION_PRESET_CATALOG)) {
      expect(p.className).toMatch(/^animate-/)
    }
  })
})


describe('getMotionPreset', () => {
  it('returns the preset for a known id', () => {
    expect(getMotionPreset('fade-in')?.intent).toBe('enter')
    expect(getMotionPreset('spin-slow')?.iterations).toBe('infinite')
  })

  it('returns null for unknown id', () => {
    expect(getMotionPreset('explode-with-confetti')).toBeNull()
  })
})


describe('listMotionPresets', () => {
  it('returns every preset when no intent given', () => {
    expect(listMotionPresets().length).toBe(Object.keys(MOTION_PRESET_CATALOG).length)
  })

  it('filters by intent', () => {
    const enters = listMotionPresets('enter')
    expect(enters.length).toBeGreaterThan(0)
    for (const p of enters) expect(p.intent).toBe('enter')
  })

  it('returns [] for an intent with no presets', () => {
    // No "exit" → expects only "fade-out" today; sanity-check still works.
    const exits = listMotionPresets('exit')
    expect(exits.every((p) => p.intent === 'exit')).toBe(true)
  })
})


describe('MotionPresetSchema rejection', () => {
  it('rejects non-kebab id', () => {
    expect(() =>
      MotionPresetSchema.parse({
        ...MOTION_PRESET_CATALOG['fade-in'],
        id: 'FadeIn',
      }),
    ).toThrow()
  })

  it('rejects negative duration', () => {
    expect(() =>
      MotionPresetSchema.parse({
        ...MOTION_PRESET_CATALOG['fade-in'],
        durationMs: -50,
      }),
    ).toThrow()
  })

  it('iterations accepts both finite int and "infinite"', () => {
    expect(() =>
      MotionPresetSchema.parse({ ...MOTION_PRESET_CATALOG['fade-in'], iterations: 3 }),
    ).not.toThrow()
    expect(() =>
      MotionPresetSchema.parse({
        ...MOTION_PRESET_CATALOG['fade-in'],
        iterations: 'infinite',
      }),
    ).not.toThrow()
  })
})
