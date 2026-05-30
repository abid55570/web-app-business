import { describe, expect, it } from 'vitest'
import {
  StudioBlockManifestSchema,
  StudioStateSchema,
  type StudioBlockManifest,
  type StudioState,
} from '../src/index.js'


describe('StudioBlockManifestSchema', () => {
  const valid: StudioBlockManifest = {
    id: 'MenuList',
    displayName: 'Menu list',
    category: 'commerce',
    componentPath: 'components/menu/MenuList',
    props: {
      title: { type: 'string', label: 'Heading', required: true },
      maxItems: { type: 'number', label: 'Max items', default: 8, min: 1, max: 50 },
      showPrices: { type: 'boolean', label: 'Show prices', default: true },
    },
    hasChildren: false,
  }

  it('parses a valid manifest', () => {
    const parsed = StudioBlockManifestSchema.parse(valid)
    expect(parsed.id).toBe('MenuList')
    expect(parsed.props.title.required).toBe(true)
    expect(parsed.props.maxItems.default).toBe(8)
  })

  it('rejects non-PascalCase id', () => {
    expect(() =>
      StudioBlockManifestSchema.parse({ ...valid, id: 'menuList' }),
    ).toThrow(/PascalCase/)
  })

  it('rejects unknown prop type', () => {
    expect(() =>
      StudioBlockManifestSchema.parse({
        ...valid,
        props: { x: { type: 'magic' as any, label: 'X' } },
      }),
    ).toThrow()
  })
})


describe('StudioStateSchema', () => {
  const valid: StudioState = {
    schemaVersion: '1.0.0',
    recipeId: 'demo-restaurant',
    updatedAt: '2026-05-11T00:00:00Z',
    pages: {
      '/menu': {
        path: '/menu',
        blocks: [
          {
            instanceId: 'mi-1',
            blockId: 'MenuList',
            sourceModuleId: 'menu',
            props: { title: 'Specials' },
            children: [],
          },
        ],
      },
    },
  }

  it('parses + applies defaults', () => {
    const parsed = StudioStateSchema.parse(valid)
    expect(parsed.pages['/menu'].blocks[0].props).toEqual({ title: 'Specials' })
  })

  it('rejects wrong schemaVersion', () => {
    expect(() =>
      StudioStateSchema.parse({ ...valid, schemaVersion: '0.9.0' as any }),
    ).toThrow()
  })

  it('themeOverrides are optional', () => {
    expect(() =>
      StudioStateSchema.parse({
        schemaVersion: '1.0.0',
        recipeId: 'x',
        updatedAt: '2026-05-11T00:00:00Z',
        pages: {},
      }),
    ).not.toThrow()
  })
})
