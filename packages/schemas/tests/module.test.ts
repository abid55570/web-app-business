import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { parse as parseYaml } from 'yaml'
import { describe, expect, it } from 'vitest'
import { ModuleSchema } from '../src/module.js'

const HERE = dirname(fileURLToPath(import.meta.url))

function loadYaml(name: string): unknown {
  return parseYaml(readFileSync(resolve(HERE, 'fixtures', name), 'utf-8'))
}

describe('ModuleSchema', () => {
  it('accepts the canonical valid fixture', () => {
    const data = loadYaml('valid-module.yaml')
    const result = ModuleSchema.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.id).toBe('orders')
      expect(result.data.implements).toContain('orders@v1')
      expect(result.data.depends_on).toContain('auth@v1')
    }
  })

  it('rejects non-kebab-case id', () => {
    const valid = loadYaml('valid-module.yaml') as object
    const data = { ...valid, id: 'OrdersModule' }
    expect(ModuleSchema.safeParse(data).success).toBe(false)
  })

  it('requires implements to be non-empty', () => {
    const valid = loadYaml('valid-module.yaml') as object
    const data = { ...valid, implements: [] }
    expect(ModuleSchema.safeParse(data).success).toBe(false)
  })

  it('rejects malformed contract refs', () => {
    const valid = loadYaml('valid-module.yaml') as object
    const data = { ...valid, implements: ['orders'] } // missing @vN
    expect(ModuleSchema.safeParse(data).success).toBe(false)
  })

  it('accepts contract refs with multi-digit versions', () => {
    const valid = loadYaml('valid-module.yaml') as object
    const data = { ...valid, implements: ['orders@v12'] }
    expect(ModuleSchema.safeParse(data).success).toBe(true)
  })

  it('rejects permissions not prefixed by module id pattern', () => {
    const valid = loadYaml('valid-module.yaml') as object
    const data = { ...valid, permissions: ['NotADotForm'] }
    expect(ModuleSchema.safeParse(data).success).toBe(false)
  })

  it('rejects events without dot-form', () => {
    const valid = loadYaml('valid-module.yaml') as object
    const data = { ...valid, emits: [{ id: 'orderplaced' }] }
    expect(ModuleSchema.safeParse(data).success).toBe(false)
  })

  it('rejects unknown config_knob types', () => {
    const valid = loadYaml('valid-module.yaml') as object
    const data = {
      ...valid,
      config_knobs: [{ id: 'foo', type: 'rocket' }],
    }
    expect(ModuleSchema.safeParse(data).success).toBe(false)
  })

  it('accepts env entries as either string shorthand or object form', () => {
    const valid = loadYaml('valid-module.yaml') as { env: unknown[] }
    expect(valid.env.length).toBeGreaterThanOrEqual(2)
    const result = ModuleSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('defaults optional arrays to empty when omitted', () => {
    const minimal = {
      id: 'tiny',
      type: 'module',
      version: '0.1.0',
      displayName: 'Tiny',
      implements: ['tiny@v1'],
    }
    const result = ModuleSchema.safeParse(minimal)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.depends_on).toEqual([])
      expect(result.data.permissions).toEqual([])
      expect(result.data.config_knobs).toEqual([])
    }
  })

  it('rejects deprecated module without proper boolean', () => {
    const valid = loadYaml('valid-module.yaml') as object
    const data = { ...valid, deprecated: 'yes' }
    expect(ModuleSchema.safeParse(data).success).toBe(false)
  })
})
