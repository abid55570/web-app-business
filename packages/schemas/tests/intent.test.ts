import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { parse as parseYaml } from 'yaml'
import { describe, expect, it } from 'vitest'
import { IntentSchema } from '../src/intent.js'

const HERE = dirname(fileURLToPath(import.meta.url))

function loadYaml(name: string): unknown {
  return parseYaml(readFileSync(resolve(HERE, 'fixtures', name), 'utf-8'))
}

describe('IntentSchema', () => {
  it('accepts the canonical valid fixture', () => {
    const data = loadYaml('valid-intent.yaml')
    const result = IntentSchema.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.id).toBe('pizza-shop')
      expect(result.data.aliases.length).toBeGreaterThan(0)
      expect(result.data.strong_signals).toContain('pizza')
      expect(result.data.multilingual.hi).toBeDefined()
    }
  })

  it('rejects non-kebab-case id', () => {
    const valid = loadYaml('valid-intent.yaml') as object
    const data = { ...valid, id: 'Pizza_Shop' }
    expect(IntentSchema.safeParse(data).success).toBe(false)
  })

  it('rejects empty canonical_name', () => {
    const valid = loadYaml('valid-intent.yaml') as object
    const data = { ...valid, canonical_name: '' }
    expect(IntentSchema.safeParse(data).success).toBe(false)
  })

  it('defaults phrases.* arrays to empty when omitted', () => {
    const minimal = {
      id: 'todo-app',
      canonical_name: 'todo app',
      oneliner: 'Personal todo list with tags and due dates.',
    }
    const result = IntentSchema.safeParse(minimal)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.aliases).toEqual([])
      expect(result.data.strong_signals).toEqual([])
      expect(result.data.phrases.intent_to_start).toEqual([])
      expect(result.data.examples).toEqual([])
    }
  })

  it('accepts boost rules in either form (when[] or when_phrase)', () => {
    const valid = loadYaml('valid-intent.yaml') as object
    const data = {
      ...valid,
      boost: [
        { when: ['pizza', 'deliver'], boost: 5 },
        { when_phrase: 'wood.?fired pizza', boost: 3 },
      ],
    }
    expect(IntentSchema.safeParse(data).success).toBe(true)
  })

  it('rejects boost rule with empty when[] list', () => {
    const valid = loadYaml('valid-intent.yaml') as object
    const data = { ...valid, boost: [{ when: [], boost: 5 }] }
    expect(IntentSchema.safeParse(data).success).toBe(false)
  })

  it('accepts emoji strings', () => {
    const valid = loadYaml('valid-intent.yaml') as object
    const data = { ...valid, emojis: ['🍕', '🍅'] }
    expect(IntentSchema.safeParse(data).success).toBe(true)
  })

  it('multilingual map can be empty', () => {
    const valid = loadYaml('valid-intent.yaml') as object
    const data = { ...valid, multilingual: {} }
    expect(IntentSchema.safeParse(data).success).toBe(true)
  })
})
