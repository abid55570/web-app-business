import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { Recipe } from '@b-dash/schemas'
import { scanModules, scanThemes } from '../src/load.js'
import { resolveRecipe, topologicalSort } from '../src/resolve.js'
import type { ResolvedModuleEntry } from '../src/types.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const FIXTURES = resolve(HERE, 'fixtures')

const minimalRecipe: Recipe = {
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

function makeRecipe(moduleIds: string[]): Recipe {
  return {
    ...minimalRecipe,
    modules: moduleIds.map((id) => ({ id, version: '1.0.0', config: {} })),
  }
}

describe('resolveRecipe', () => {
  it('looks up modules + theme from the inventory', async () => {
    const modules = await scanModules(resolve(FIXTURES, 'modules'))
    const themes = await scanThemes(resolve(FIXTURES, 'themes'))
    const r = resolveRecipe({
      recipe: makeRecipe(['auth', 'payment-fake', 'orders']),
      modules,
      themes,
    })
    expect(r.modules).toHaveLength(3)
    expect(r.theme.pack).toBe('minimal')
  })

  it('throws WIRER_TEMPLATE_MISSING when a module is unknown', async () => {
    const modules = await scanModules(resolve(FIXTURES, 'modules'))
    const themes = await scanThemes(resolve(FIXTURES, 'themes'))
    expect(() =>
      resolveRecipe({
        recipe: makeRecipe(['nonexistent-module']),
        modules,
        themes,
      }),
    ).toThrow(/Module 'nonexistent-module' not found|Theme pack 'nope' not found/)
  })

  it('throws WIRER_TEMPLATE_MISSING when the theme pack is unknown', async () => {
    const modules = await scanModules(resolve(FIXTURES, 'modules'))
    const themes = await scanThemes(resolve(FIXTURES, 'themes'))
    expect(() =>
      resolveRecipe({
        recipe: { ...makeRecipe(['auth']), theme: { pack: 'nope' } },
        modules,
        themes,
      }),
    ).toThrow(/Module 'nonexistent-module' not found|Theme pack 'nope' not found/)
  })

  it('produces topologically-sorted modules', async () => {
    const modules = await scanModules(resolve(FIXTURES, 'modules'))
    const themes = await scanThemes(resolve(FIXTURES, 'themes'))
    const r = resolveRecipe({
      // intentionally out-of-order
      recipe: makeRecipe(['orders', 'auth', 'payment-fake']),
      modules,
      themes,
    })
    const ids = r.modules.map((m) => m.id)
    // auth and payment-fake have no deps -> appear before orders
    expect(ids.indexOf('auth')).toBeLessThan(ids.indexOf('orders'))
    expect(ids.indexOf('payment-fake')).toBeLessThan(ids.indexOf('orders'))
  })

  it('detects cycles', async () => {
    const modules = await scanModules(resolve(FIXTURES, 'modules'))
    const themes = await scanThemes(resolve(FIXTURES, 'themes'))
    expect(() =>
      resolveRecipe({
        recipe: makeRecipe(['cycle-a', 'cycle-b']),
        modules,
        themes,
      }),
    ).toThrow(/cycle detected/)
  })
})

describe('topologicalSort', () => {
  function entry(id: string, implementsContracts: string[], deps: string[]): ResolvedModuleEntry {
    return {
      id,
      version: '1.0.0',
      config: {},
      manifestPath: `/fake/${id}/module.yaml`,
      manifest: {
        id,
        type: 'module',
        version: '1.0.0',
        displayName: id,
        implements: implementsContracts,
        depends_on: deps,
        optional_integrations: [],
        incompatible_with: [],
        config_knobs: [],
        emits: [],
        subscribes: [],
        ui_contributions: {
          nav: [],
          dashboard_widgets: [],
          pages: [],
          studio_blocks: [],
          studio_sections: [],
        },
        permissions: [],
        locales: [],
        env: [],
        tests: { contract: [], smoke: [], fixtures: [] },
        deprecated: false,
      },
    }
  }

  it('returns [] for empty input', () => {
    expect(topologicalSort([])).toEqual([])
  })

  it('preserves a single module', () => {
    const a = entry('a', ['x@v1'], [])
    expect(topologicalSort([a])).toEqual([a])
  })

  it('orders providers before dependents', () => {
    const auth = entry('auth', ['auth@v1'], [])
    const orders = entry('orders', ['orders@v1'], ['auth@v1'])
    const out = topologicalSort([orders, auth])
    expect(out.map((m) => m.id)).toEqual(['auth', 'orders'])
  })

  it('breaks ties alphabetically for determinism', () => {
    const a = entry('a', ['a@v1'], [])
    const b = entry('b', ['b@v1'], [])
    const out = topologicalSort([b, a])
    expect(out.map((m) => m.id)).toEqual(['a', 'b'])
  })

  it('throws on cycles', () => {
    const a = entry('a', ['x@v1'], ['y@v1'])
    const b = entry('b', ['y@v1'], ['x@v1'])
    expect(() => topologicalSort([a, b])).toThrow(/cycle detected/)
  })

  it('handles multi-step chains', () => {
    const a = entry('a', ['a@v1'], [])
    const b = entry('b', ['b@v1'], ['a@v1'])
    const c = entry('c', ['c@v1'], ['b@v1'])
    const out = topologicalSort([c, a, b])
    expect(out.map((m) => m.id)).toEqual(['a', 'b', 'c'])
  })

  it('ignores deps on contracts no module in the recipe provides', () => {
    // depends on x@v1 but no provider in recipe — should NOT add an edge,
    // so the module is still in the output (compatibility check catches the
    // missing provider separately).
    const a = entry('a', ['a@v1'], ['x@v1'])
    const out = topologicalSort([a])
    expect(out.map((m) => m.id)).toEqual(['a'])
  })
})
