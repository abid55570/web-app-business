import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { SchemaValidationError } from '@b-dash/schemas'
import {
  loadModuleFromDir,
  loadThemeFromDir,
  scanModules,
  scanThemes,
} from '../src/load.js'
import { WirerError } from '../src/errors.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const FIXTURES = resolve(HERE, 'fixtures')

describe('loadModuleFromDir', () => {
  it('loads + validates a real module.yaml', async () => {
    const m = await loadModuleFromDir(resolve(FIXTURES, 'modules/auth'))
    expect(m.id).toBe('auth')
    expect(m.manifest.implements).toContain('auth@v1')
    expect(m.manifestPath).toMatch(/module\.yaml$/)
  })

  it('throws WIRER_TEMPLATE_MISSING when no module.yaml exists', async () => {
    await expect(
      loadModuleFromDir(resolve(FIXTURES, 'modules/not-a-module')),
    ).rejects.toMatchObject({
      name: 'WirerError',
      code: 'WIRER_TEMPLATE_MISSING',
    })
  })

  it('rethrows SchemaValidationError on a malformed module.yaml', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'wirer-load-'))
    try {
      await writeFile(
        join(dir, 'module.yaml'),
        'id: BadCase\ntype: module\nversion: 1.0.0\ndisplayName: x\nimplements: []\n',
        'utf-8',
      )
      await expect(loadModuleFromDir(dir)).rejects.toBeInstanceOf(
        SchemaValidationError,
      )
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })
})

describe('loadThemeFromDir', () => {
  it('loads theme.yaml + tokens.json', async () => {
    const t = await loadThemeFromDir(resolve(FIXTURES, 'themes/minimal'))
    expect(t.pack).toBe('minimal')
    expect(t.tokens.colors.primary['500']).toBe('#0ea5e9')
    expect(t.darkTokens).toBeNull()
  })

  it('throws WIRER_TEMPLATE_MISSING when no theme.yaml exists', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'wirer-theme-'))
    try {
      await expect(loadThemeFromDir(dir)).rejects.toMatchObject({
        name: 'WirerError',
        code: 'WIRER_TEMPLATE_MISSING',
      })
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })

  it('loads dark tokens when present', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'wirer-theme-dark-'))
    try {
      // Copy minimal theme + add dark tokens
      const { readFile } = await import('node:fs/promises')
      const themeYaml = await readFile(
        resolve(FIXTURES, 'themes/minimal/theme.yaml'),
        'utf-8',
      )
      const tokensJson = await readFile(
        resolve(FIXTURES, 'themes/minimal/tokens.json'),
        'utf-8',
      )
      await writeFile(join(dir, 'theme.yaml'), themeYaml, 'utf-8')
      await writeFile(join(dir, 'tokens.json'), tokensJson, 'utf-8')
      await writeFile(join(dir, 'tokens.dark.json'), tokensJson, 'utf-8')

      const t = await loadThemeFromDir(dir)
      expect(t.darkTokens).not.toBeNull()
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })
})

describe('scanModules', () => {
  it('finds every module with a manifest, sorted by id', async () => {
    const mods = await scanModules(resolve(FIXTURES, 'modules'))
    const ids = mods.map((m) => m.id)
    expect(ids).toContain('auth')
    expect(ids).toContain('menu')
    expect(ids).toContain('orders')
    expect(ids).toContain('payment-fake')
    expect(ids).toContain('notifications')
    // not-a-module/ has no manifest -> silently skipped
    expect(ids).not.toContain('not-a-module')
    // sorted
    expect(ids).toEqual([...ids].sort())
  })

  it('returns [] for a non-existent directory', async () => {
    const mods = await scanModules(resolve(FIXTURES, 'does-not-exist'))
    expect(mods).toEqual([])
  })
})

describe('scanThemes', () => {
  it('finds the minimal theme fixture', async () => {
    const themes = await scanThemes(resolve(FIXTURES, 'themes'))
    expect(themes.map((t) => t.pack)).toEqual(['minimal'])
  })

  it('returns [] for a non-existent directory', async () => {
    const themes = await scanThemes(resolve(FIXTURES, 'does-not-exist'))
    expect(themes).toEqual([])
  })
})

describe('WirerError', () => {
  it('exposes code + details', () => {
    const e = new WirerError('WIRER_TEMPLATE_MISSING', 'gone', { dir: '/x' })
    expect(e.code).toBe('WIRER_TEMPLATE_MISSING')
    expect(e.details).toEqual({ dir: '/x' })
    expect(e.name).toBe('WirerError')
  })
})
