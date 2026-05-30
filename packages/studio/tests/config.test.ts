import { describe, expect, it } from 'vitest'
import { buildStudioConfig } from '../src/config.js'


describe('buildStudioConfig', () => {
  it('packs blocks + tokens + pages + render version', () => {
    const c = buildStudioConfig({
      blocks: [
        {
          id: 'HeroSplit',
          displayName: 'Hero — split',
          category: 'hero',
          fields: {},
          defaultProps: {},
        },
      ],
      pages: [{ path: '/', layout: 'public' }],
      renderVersion: '0.1.0',
    })
    expect(c.blocks).toHaveLength(1)
    expect(c.pages).toHaveLength(1)
    expect(c.themeTokens).toBeNull()
    expect(c.generatedAtRenderVersion).toBe('0.1.0')
  })

  it('defaults pages to empty when omitted', () => {
    const c = buildStudioConfig({ blocks: [], renderVersion: '0.1.0' })
    expect(c.pages).toEqual([])
  })
})
