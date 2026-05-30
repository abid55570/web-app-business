import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { parse as parseYaml } from 'yaml'
import { describe, expect, it } from 'vitest'
import { ThemeManifestSchema, TokensSchema } from '../src/theme.js'

const HERE = dirname(fileURLToPath(import.meta.url))

function loadYaml(name: string): unknown {
  return parseYaml(readFileSync(resolve(HERE, 'fixtures', name), 'utf-8'))
}

function loadJson(name: string): unknown {
  return JSON.parse(readFileSync(resolve(HERE, 'fixtures', name), 'utf-8'))
}

describe('ThemeManifestSchema', () => {
  it('accepts the canonical valid fixture', () => {
    const data = loadYaml('valid-theme.yaml')
    const result = ThemeManifestSchema.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.id).toBe('minimal')
      expect(result.data.darkModeSupport).toBe(true)
    }
  })

  it('rejects darkModeSupport=false (constraint per PLAN §1.1)', () => {
    const valid = loadYaml('valid-theme.yaml') as object
    const data = { ...valid, darkModeSupport: false }
    const result = ThemeManifestSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('dark mode')
    }
  })

  it('rejects mobileOptimized=false', () => {
    const valid = loadYaml('valid-theme.yaml') as object
    const data = { ...valid, mobileOptimized: false }
    expect(ThemeManifestSchema.safeParse(data).success).toBe(false)
  })

  it('rejects unknown category', () => {
    const valid = loadYaml('valid-theme.yaml') as object
    const data = { ...valid, category: 'unicorn' }
    expect(ThemeManifestSchema.safeParse(data).success).toBe(false)
  })

  it('defaults motionPreset to standard when omitted', () => {
    const valid = loadYaml('valid-theme.yaml') as Record<string, unknown>
    const { motionPreset: _omit, ...rest } = valid
    const result = ThemeManifestSchema.safeParse(rest)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.motionPreset).toBe('standard')
    }
  })
})

describe('TokensSchema', () => {
  it('accepts the canonical valid tokens fixture', () => {
    const data = loadJson('valid-tokens.json')
    const result = TokensSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('rejects tokens missing primary color scale', () => {
    const valid = loadJson('valid-tokens.json') as Record<string, unknown>
    const colors = valid.colors as Record<string, unknown>
    const { primary: _omit, ...rest } = colors
    const data = { ...valid, colors: rest }
    expect(TokensSchema.safeParse(data).success).toBe(false)
  })

  it('rejects tokens missing scale shade 950', () => {
    const valid = loadJson('valid-tokens.json') as Record<string, unknown>
    const colors = JSON.parse(JSON.stringify(valid.colors)) as Record<string, Record<string, string>>
    delete colors.primary['950']
    const data = { ...valid, colors }
    expect(TokensSchema.safeParse(data).success).toBe(false)
  })

  it('rejects malformed hex color', () => {
    const valid = loadJson('valid-tokens.json') as Record<string, unknown>
    const colors = JSON.parse(JSON.stringify(valid.colors)) as Record<string, Record<string, string>>
    colors.primary['500'] = 'red'
    const data = { ...valid, colors }
    expect(TokensSchema.safeParse(data).success).toBe(false)
  })

  it('rejects tokens with missing motion duration scale', () => {
    const valid = loadJson('valid-tokens.json') as Record<string, unknown>
    const motion = JSON.parse(JSON.stringify(valid.motion)) as Record<string, unknown>
    delete (motion.duration as Record<string, string>).base
    const data = { ...valid, motion }
    expect(TokensSchema.safeParse(data).success).toBe(false)
  })
})
