import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { Recipe } from '@b-dash/schemas'
import { buildWirePlan } from '../src/index.js'
import { scanModules, scanThemes } from '../src/load.js'
import { deriveSubscriptions } from '../src/render/derive-subscriptions.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_MODULES = resolve(HERE, '../../../modules')
const REPO_THEMES = resolve(HERE, '../../../themes')

const baseRecipe: Recipe = {
  schemaVersion: '1.0.0',
  id: 'sub-test',
  createdAt: '2026-05-09T00:00:00Z',
  archetype: 'business',
  stack: { backend: 'fastapi', frontend: 'nextjs', database: 'postgres' },
  modules: [],
  integrations: {},
  auth: { methods: ['email-password'] },
  theme: { pack: 'minimal' },
  branding: { name: 'Sub Test' },
}

describe('deriveSubscriptions', () => {
  let outDir: string

  beforeEach(async () => {
    outDir = await mkdtemp(join(tmpdir(), 'wirer-subs-'))
  })

  afterEach(async () => {
    await rm(outDir, { recursive: true, force: true })
  })

  it('emits subscribe() calls + imports for module subscribes blocks', async () => {
    const modules = await scanModules(REPO_MODULES)
    const themes = await scanThemes(REPO_THEMES)
    const recipe: Recipe = {
      ...baseRecipe,
      modules: [
        { id: 'events-bus', version: '1.0.0', config: {} },
        { id: 'auth-core', version: '1.0.0', config: {} },
        { id: 'auth-jwt', version: '1.0.0', config: {} },
        { id: 'orders', version: '1.0.0', config: {} },
        { id: 'menu', version: '1.0.0', config: {} },
        { id: 'payment-core', version: '1.0.0', config: {} },
        { id: 'payment-fake', version: '1.0.0', config: {} },
        { id: 'notifications', version: '1.0.0', config: {} },
      ],
    }
    const plan = buildWirePlan({ recipe, modules, themes })

    const dest = await deriveSubscriptions({ plan, outputDir: outDir })
    const content = await readFile(dest, 'utf-8')

    // Bus import always present
    expect(content).toContain('from app.events_bus.bus import subscribe')
    // Notifications handlers imported (deduped per source module)
    expect(content).toContain(
      'from app.notifications.handlers import handle_order_cancelled, handle_order_placed',
    )
    // Subscriptions registered
    expect(content).toContain(
      'subscribe("order.placed", handle_order_placed)',
    )
    expect(content).toContain(
      'subscribe("order.cancelled", handle_order_cancelled)',
    )
    // No skipped comment for the live modules
    expect(content).not.toContain('Skipped (non-Python handler paths)')
  })

  it('emits a no-op register_subscriptions when nothing subscribes', async () => {
    const modules = await scanModules(REPO_MODULES)
    const themes = await scanThemes(REPO_THEMES)
    const recipe: Recipe = {
      ...baseRecipe,
      modules: [
        { id: 'events-bus', version: '1.0.0', config: {} },
        { id: 'auth', version: '1.0.0', config: {} },
      ],
    }
    const plan = buildWirePlan({ recipe, modules, themes })

    const dest = await deriveSubscriptions({ plan, outputDir: outDir })
    const content = await readFile(dest, 'utf-8')

    expect(content).toContain('def register_subscriptions()')
    expect(content).toContain('pass  # no subscriptions registered')
    // No bogus from-imports beyond the bus itself
    expect(content).not.toMatch(/from app\.\w+\.handlers/)
  })
})
