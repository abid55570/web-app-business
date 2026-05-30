import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { Recipe } from '@b-dash/schemas'
import { checkCompatibility } from '../src/compatibility.js'
import { scanModules, scanThemes } from '../src/load.js'
import { resolveRecipe } from '../src/resolve.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const FIXTURES = resolve(HERE, 'fixtures')

const baseRecipe: Recipe = {
  schemaVersion: '1.0.0',
  id: 'test-app',
  createdAt: '2026-05-09T00:00:00Z',
  archetype: 'business',
  stack: { backend: 'fastapi', frontend: 'nextjs', database: 'sqlite' },
  modules: [],
  integrations: {},
  auth: { methods: ['email-password'] },
  theme: { pack: 'minimal' },
  branding: { name: 'Test' },
}

function recipeWith(ids: string[]): Recipe {
  return { ...baseRecipe, modules: ids.map((id) => ({ id, version: '1.0.0', config: {} })) }
}

async function resolve_(ids: string[]) {
  const modules = await scanModules(resolve(FIXTURES, 'modules'))
  const themes = await scanThemes(resolve(FIXTURES, 'themes'))
  return resolveRecipe({ recipe: recipeWith(ids), modules, themes })
}

describe('checkCompatibility', () => {
  it('passes when every depends_on contract has a provider', async () => {
    const r = await resolve_(['auth', 'payment-fake', 'orders'])
    expect(() => checkCompatibility(r)).not.toThrow()
  })

  it('throws RECIPE_MISSING_PROVIDER when a depends_on has no provider', async () => {
    // orders depends on auth@v1 + payment@v1 — omit payment
    const r = await resolve_(['auth', 'orders'])
    expect(() => checkCompatibility(r)).toThrow(/depends on contract/)
  })

  it('throws with the missing contract in the error', async () => {
    const r = await resolve_(['auth', 'orders'])
    try {
      checkCompatibility(r)
    } catch (e) {
      expect((e as Error).message).toContain('payment@v1')
    }
  })

  it('throws RECIPE_INCOMPATIBLE when two mutually-incompatible modules are in the recipe', async () => {
    const r = await resolve_(['incompat-x', 'incompat-y'])
    expect(() => checkCompatibility(r)).toThrow(/incompatible with/)
  })

  it('passes for a single module from an incompatible pair', async () => {
    const r = await resolve_(['incompat-x'])
    expect(() => checkCompatibility(r)).not.toThrow()
  })

  it('passes for an empty module set', async () => {
    const r = await resolve_([])
    expect(() => checkCompatibility(r)).not.toThrow()
  })
})
