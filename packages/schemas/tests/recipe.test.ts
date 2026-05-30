import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { RecipeSchema } from '../src/recipe.js'

const HERE = dirname(fileURLToPath(import.meta.url))

function loadFixture(name: string): unknown {
  return JSON.parse(readFileSync(resolve(HERE, 'fixtures', name), 'utf-8'))
}

describe('RecipeSchema', () => {
  it('accepts the canonical valid fixture', () => {
    const data = loadFixture('valid-recipe.json')
    const result = RecipeSchema.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.id).toBe('pizzapalace')
      expect(result.data.archetype).toBe('business')
      expect(result.data.modules).toHaveLength(3)
    }
  })

  it('rejects unknown schemaVersion', () => {
    const data = { ...(loadFixture('valid-recipe.json') as object), schemaVersion: '0.9.0' }
    expect(RecipeSchema.safeParse(data).success).toBe(false)
  })

  it('rejects invalid id pattern', () => {
    const data = { ...(loadFixture('valid-recipe.json') as object), id: 'X' }
    const result = RecipeSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === 'id')).toBe(true)
    }
  })

  it('rejects unknown archetype', () => {
    const data = { ...(loadFixture('valid-recipe.json') as object), archetype: 'unknown' }
    expect(RecipeSchema.safeParse(data).success).toBe(false)
  })

  it('rejects unknown backend stack', () => {
    const valid = loadFixture('valid-recipe.json') as { stack: { backend: string } }
    const data = { ...valid, stack: { ...valid.stack, backend: 'rails' } }
    expect(RecipeSchema.safeParse(data).success).toBe(false)
  })

  it('rejects modules with invalid version', () => {
    const valid = loadFixture('valid-recipe.json') as { modules: { version: string }[] }
    const data = {
      ...valid,
      modules: [{ id: 'orders', version: 'v1', config: {} }],
    }
    expect(RecipeSchema.safeParse(data).success).toBe(false)
  })

  it('requires at least one auth method', () => {
    const valid = loadFixture('valid-recipe.json') as object
    const data = { ...valid, auth: { methods: [] } }
    expect(RecipeSchema.safeParse(data).success).toBe(false)
  })

  it('rejects unknown notification channels', () => {
    const valid = loadFixture('valid-recipe.json') as object
    const data = { ...valid, notifications: { channels: ['carrier-pigeon'] } }
    expect(RecipeSchema.safeParse(data).success).toBe(false)
  })

  it('rejects malformed primaryColor', () => {
    const valid = loadFixture('valid-recipe.json') as { branding: { primaryColor: string } }
    const data = { ...valid, branding: { ...valid.branding, primaryColor: 'red' } }
    expect(RecipeSchema.safeParse(data).success).toBe(false)
  })

  it('makes integrations default to empty when omitted', () => {
    const valid = loadFixture('valid-recipe.json') as Record<string, unknown>
    const { integrations: _omit, ...rest } = valid
    const result = RecipeSchema.safeParse(rest)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.integrations).toEqual({})
    }
  })

  it('accepts a minimal recipe with only required fields', () => {
    const minimal = {
      schemaVersion: '1.0.0',
      id: 'todo-app',
      createdAt: '2026-05-09T00:00:00Z',
      archetype: 'productivity',
      stack: { backend: 'fastapi', frontend: 'nextjs', database: 'sqlite' },
      modules: [],
      auth: { methods: ['email-password'] },
      theme: { pack: 'minimal' },
      branding: { name: 'My Todo' },
    }
    const result = RecipeSchema.safeParse(minimal)
    expect(result.success).toBe(true)
  })
})
