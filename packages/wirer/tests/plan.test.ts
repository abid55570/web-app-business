import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { Recipe } from '@b-dash/schemas'
import { buildWirePlan } from '../src/index.js'
import { scanModules, scanThemes } from '../src/load.js'

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

async function loadInventory() {
  return {
    modules: await scanModules(resolve(FIXTURES, 'modules')),
    themes: await scanThemes(resolve(FIXTURES, 'themes')),
  }
}

describe('buildWirePlan', () => {
  it('builds a complete plan for a valid recipe', async () => {
    const inv = await loadInventory()
    const recipe: Recipe = {
      ...baseRecipe,
      modules: ['auth', 'payment-fake', 'orders'].map((id) => ({
        id,
        version: '1.0.0',
        config: {},
      })),
    }
    const plan = buildWirePlan({ recipe, ...inv })

    expect(plan.resolvedRecipe.modules.map((m) => m.id)).toEqual([
      'auth',
      'payment-fake',
      'orders',
    ])
    expect(plan.emitters['orders.placed']).toEqual(['orders'])
    expect(plan.emitters['payment.succeeded']).toEqual(['payment-fake'])
    expect(plan.emitters['auth.user.signed-up']).toEqual(['auth'])
    expect(plan.permissions).toEqual(
      expect.arrayContaining([
        'auth.view-self',
        'orders.view',
        'orders.create',
        'orders.refund',
        'payment.refund',
      ]),
    )
    expect(plan.permissions).toEqual([...plan.permissions].sort())
    expect(plan.conflicts).toEqual([])
  })

  it('indexes subscribers by event id', async () => {
    const inv = await loadInventory()
    const recipe: Recipe = {
      ...baseRecipe,
      modules: ['auth', 'payment-fake', 'events-bus', 'orders', 'notifications'].map(
        (id) => ({ id, version: '1.0.0', config: {} }),
      ),
    }
    const plan = buildWirePlan({ recipe, ...inv })
    expect(plan.subscribers['orders.placed']).toEqual(['notifications'])
    expect(plan.subscribers['orders.cancelled']).toEqual(['notifications'])
  })

  it('reports conflicts (does not throw)', async () => {
    const inv = await loadInventory()
    const recipe: Recipe = {
      ...baseRecipe,
      modules: ['conflict-a', 'conflict-b'].map((id) => ({
        id,
        version: '1.0.0',
        config: {},
      })),
    }
    const plan = buildWirePlan({ recipe, ...inv })
    expect(plan.conflicts.length).toBeGreaterThan(0)
  })

  it('throws RECIPE_MISSING_PROVIDER on missing dep before reporting conflicts', async () => {
    const inv = await loadInventory()
    const recipe: Recipe = {
      ...baseRecipe,
      modules: [{ id: 'orders', version: '1.0.0', config: {} }], // missing auth + payment
    }
    expect(() => buildWirePlan({ recipe, ...inv })).toThrow(
      /depends on contract/,
    )
  })
})
