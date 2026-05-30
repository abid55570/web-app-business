import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { Recipe } from '@b-dash/schemas'
import { detectFileConflicts } from '../src/conflicts.js'
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

async function resolve_(ids: string[]) {
  const modules = await scanModules(resolve(FIXTURES, 'modules'))
  const themes = await scanThemes(resolve(FIXTURES, 'themes'))
  return resolveRecipe({
    recipe: { ...baseRecipe, modules: ids.map((id) => ({ id, version: '1.0.0', config: {} })) },
    modules,
    themes,
  })
}

describe('detectFileConflicts', () => {
  it('returns no conflicts for a clean recipe', async () => {
    const r = await resolve_(['auth', 'payment-fake', 'orders'])
    expect(detectFileConflicts(r)).toEqual([])
  })

  it('flags two modules claiming the same page path', async () => {
    const r = await resolve_(['conflict-a', 'conflict-b'])
    const conflicts = detectFileConflicts(r)
    expect(conflicts).toHaveLength(1)
    expect(conflicts[0]?.path).toBe('/admin/orders')
    expect(conflicts[0]?.contributors).toEqual(['conflict-a', 'conflict-b'])
  })

  it('does not flag a single contributor', async () => {
    const r = await resolve_(['conflict-a'])
    expect(detectFileConflicts(r)).toEqual([])
  })

  it('returns conflicts sorted by path for stable output', async () => {
    // Both conflict-a and orders claim /admin/orders, so we expect at least
    // one conflict. Conflicting paths should sort alphabetically.
    const r = await resolve_(['conflict-a', 'conflict-b', 'orders'])
    const conflicts = detectFileConflicts(r)
    const paths = conflicts.map((c) => c.path)
    expect(paths).toEqual([...paths].sort())
  })
})
