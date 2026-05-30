import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { inferArtifact, runValidate } from '../src/commands/validate.js'

describe('inferArtifact', () => {
  it('infers recipe from recipe.json', () => {
    expect(inferArtifact('/some/path/recipe.json')).toBe('recipe')
  })

  it('infers recipe from <name>.recipe.json', () => {
    expect(inferArtifact('/some/path/pizza-shop.recipe.json')).toBe('recipe')
  })

  it('infers module from module.yaml', () => {
    expect(inferArtifact('modules/orders/module.yaml')).toBe('module')
  })

  it('infers module from module.yml', () => {
    expect(inferArtifact('module.yml')).toBe('module')
  })

  it('infers theme', () => {
    expect(inferArtifact('themes/minimal/theme.yaml')).toBe('theme')
  })

  it('infers tokens', () => {
    expect(inferArtifact('themes/minimal/tokens.json')).toBe('tokens')
  })

  it('infers intent', () => {
    expect(inferArtifact('starters/pizza-shop/intent.yaml')).toBe('intent')
  })

  it('returns null for unknown filenames', () => {
    expect(inferArtifact('arbitrary.json')).toBe(null)
  })
})

describe('runValidate', () => {
  let dir: string
  let stderr = ''
  let stdout = ''

  const captureStderr = (chunk: string | Uint8Array) => {
    stderr += chunk.toString()
    return true
  }
  const captureStdout = (chunk: string | Uint8Array) => {
    stdout += chunk.toString()
    return true
  }

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'cli-validate-test-'))
    stderr = ''
    stdout = ''
    process.stderr.write = captureStderr as typeof process.stderr.write
    process.stdout.write = captureStdout as typeof process.stdout.write
  })

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true })
    // restore (vitest resets between modules; this is just a guard)
  })

  it('returns 2 when no file argument is supplied', async () => {
    const code = await runValidate([])
    expect(code).toBe(2)
    expect(stderr).toMatch(/Usage:/)
  })

  it('returns 2 when artifact cannot be inferred and --as is missing', async () => {
    const filePath = join(dir, 'arbitrary.json')
    await writeFile(filePath, '{}', 'utf-8')
    const code = await runValidate([filePath])
    expect(code).toBe(2)
    expect(stderr).toMatch(/Could not infer/)
  })

  it('returns 0 with green check on a valid recipe.json', async () => {
    const filePath = join(dir, 'recipe.json')
    await writeFile(
      filePath,
      JSON.stringify({
        schemaVersion: '1.0.0',
        id: 'todo-app',
        createdAt: '2026-05-09T00:00:00Z',
        archetype: 'productivity',
        stack: { backend: 'fastapi', frontend: 'nextjs', database: 'sqlite' },
        modules: [],
        auth: { methods: ['email-password'] },
        theme: { pack: 'minimal' },
        branding: { name: 'My Todo' },
      }),
      'utf-8',
    )
    const code = await runValidate([filePath])
    expect(code).toBe(0)
    expect(stdout).toMatch(/valid recipe/)
  })

  it('returns 1 with formatted errors on an invalid recipe', async () => {
    const filePath = join(dir, 'recipe.json')
    await writeFile(
      filePath,
      JSON.stringify({
        schemaVersion: '0.0.1',
        id: 'X',
        archetype: 'unknown',
      }),
      'utf-8',
    )
    const code = await runValidate([filePath])
    expect(code).toBe(1)
    expect(stderr).toMatch(/recipe schema validation failed/)
    // Should report at least the bad schemaVersion + bad id
    expect(stderr).toMatch(/schemaVersion/)
  })

  it('uses --as when filename is unrecognizable', async () => {
    const filePath = join(dir, 'pizza.yml')
    await writeFile(
      filePath,
      `id: pizza-shop\ncanonical_name: "pizza shop"\noneliner: "Pizza shop."\n`,
      'utf-8',
    )
    const code = await runValidate([filePath, '--as', 'intent'])
    expect(code).toBe(0)
    expect(stdout).toMatch(/valid intent/)
  })

  it('rejects unknown --as values', async () => {
    const filePath = join(dir, 'whatever.json')
    await writeFile(filePath, '{}', 'utf-8')
    const code = await runValidate([filePath, '--as', 'spaceship'])
    expect(code).toBe(1)
    expect(stderr).toMatch(/Unknown artifact type/)
  })
})
