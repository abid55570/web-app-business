import { writeFile, rm, mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { z } from 'zod'
import { SchemaValidationError } from '../src/errors.js'
import { loadAndValidate, validate } from '../src/loaders.js'
import { RecipeSchema } from '../src/recipe.js'
import { ModuleSchema } from '../src/module.js'

const HERE = dirname(fileURLToPath(import.meta.url))

describe('validate()', () => {
  it('returns parsed data when valid', () => {
    const schema = z.object({ name: z.string() })
    const out = validate(schema, { name: 'ok' }, 'recipe')
    expect(out).toEqual({ name: 'ok' })
  })

  it('throws SchemaValidationError when invalid', () => {
    const schema = z.object({ name: z.string() })
    try {
      validate(schema, { name: 42 }, 'recipe')
      expect.fail('should have thrown')
    } catch (e) {
      expect(e).toBeInstanceOf(SchemaValidationError)
      const err = e as SchemaValidationError
      expect(err.artifact).toBe('recipe')
      expect(err.issues.length).toBeGreaterThan(0)
    }
  })

  it('SchemaValidationError.format() produces a multi-line message', () => {
    const schema = z.object({ a: z.string(), b: z.number() })
    try {
      validate(schema, {}, 'module', '/path/to/manifest.yaml')
    } catch (e) {
      const err = e as SchemaValidationError
      const msg = err.format()
      expect(msg).toContain('module schema validation failed at /path/to/manifest.yaml')
      expect(msg).toContain('  • a:')
      expect(msg).toContain('  • b:')
    }
  })
})

describe('loadAndValidate()', () => {
  it('loads + validates a real recipe.json fixture', async () => {
    const fixturePath = resolve(HERE, 'fixtures/valid-recipe.json')
    const recipe = await loadAndValidate(RecipeSchema, fixturePath, 'recipe')
    expect(recipe.id).toBe('pizzapalace')
  })

  it('loads + validates a real module.yaml fixture', async () => {
    const fixturePath = resolve(HERE, 'fixtures/valid-module.yaml')
    const module = await loadAndValidate(ModuleSchema, fixturePath, 'module')
    expect(module.id).toBe('orders')
  })

  describe('with a temp directory', () => {
    let dir: string

    beforeEach(async () => {
      dir = await mkdtemp(join(tmpdir(), 'b-dash-loader-test-'))
    })

    afterEach(async () => {
      await rm(dir, { recursive: true, force: true })
    })

    it('rejects unsupported file extensions', async () => {
      const path = join(dir, 'recipe.toml')
      await writeFile(path, 'whatever', 'utf-8')
      await expect(
        loadAndValidate(RecipeSchema, path, 'recipe'),
      ).rejects.toThrow(/Unsupported file extension/)
    })

    it('throws SchemaValidationError on malformed JSON', async () => {
      const path = join(dir, 'recipe.json')
      await writeFile(path, '{not json', 'utf-8')
      try {
        await loadAndValidate(RecipeSchema, path, 'recipe')
        expect.fail('should have thrown')
      } catch (e) {
        expect(e).toBeInstanceOf(SchemaValidationError)
        expect((e as SchemaValidationError).format()).toMatch(/failed to parse/)
      }
    })

    it('loads YAML files', async () => {
      const path = join(dir, 'module.yaml')
      await writeFile(
        path,
        `id: tiny
type: module
version: 0.1.0
displayName: "Tiny"
implements: ["tiny@v1"]
`,
        'utf-8',
      )
      const module = await loadAndValidate(ModuleSchema, path, 'module')
      expect(module.id).toBe('tiny')
    })

    it('loads .yml files', async () => {
      const path = join(dir, 'module.yml')
      await writeFile(
        path,
        `id: tiny
type: module
version: 0.1.0
displayName: "Tiny"
implements: ["tiny@v1"]
`,
        'utf-8',
      )
      const module = await loadAndValidate(ModuleSchema, path, 'module')
      expect(module.id).toBe('tiny')
    })
  })
})
