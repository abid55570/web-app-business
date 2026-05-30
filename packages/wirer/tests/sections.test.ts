import { describe, expect, it } from 'vitest'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { scanSections, loadSectionFromDir } from '../src/load.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const SECTIONS_ROOT = resolve(HERE, '../../../sections')


describe('scanSections', () => {
  it('discovers every section under <root>/<category>/<id>/section.yaml', { timeout: 30000 }, async () => {
    const sections = await scanSections(SECTIONS_ROOT)
    const ids = sections.map((s) => s.id)
    // Use toContain per id so adding new sections does not churn this test.
    for (const expected of [
      'AnnouncementBar',
      'ArticleHero',
      'BreadcrumbTrail',
      'ContactForm',
      'CtaCentered',
      'CtaSplit',
      'FaqAccordion',
      'FeatureComparison',
      'FeatureGrid3Col',
      'FeaturesBento',
      'FooterColumns',
      'FooterMega',
      'HeroSplit',
      'LogoStrip',
      'MasonryGallery',
      'NewsletterSignup',
      'PricingTable3Tier',
      'PricingTableToggle',
      'PullQuote',
      'SectionDivider',
      'SidebarNav',
      'StatsCounter',
      'StepsHorizontal',
      'TeamGrid',
      'TestimonialsCarousel',
      'TestimonialsGrid',
      'TimelineVertical',
      'TopNav',
    ]) {
      expect(ids).toContain(expected)
    }
  })

  it('returns sections sorted by id', { timeout: 30000 }, async () => {
    const sections = await scanSections(SECTIONS_ROOT)
    for (let i = 1; i < sections.length; i++) {
      expect(sections[i - 1].id.localeCompare(sections[i].id)).toBeLessThan(0)
    }
  })

  it('resolves componentPath relative to manifest dir', { timeout: 30000 }, async () => {
    const sections = await scanSections(SECTIONS_ROOT)
    const hero = sections.find((s) => s.id === 'HeroSplit')!
    expect(hero.componentPath).toMatch(/HeroSplit\.tsx$/)
    expect(hero.componentPath).toMatch(/HeroSplit/)
  })

  it('returns [] when sectionsRoot does not exist', async () => {
    const sections = await scanSections('/nonexistent/path/12345')
    expect(sections).toEqual([])
  })

  it('every loaded section validates against SectionSchema', { timeout: 30000 }, async () => {
    const sections = await scanSections(SECTIONS_ROOT)
    for (const s of sections) {
      // SchemaValidationError would have thrown in scanSections — getting here
      // proves the manifest parsed clean. Just sanity-check a few invariants.
      expect(s.manifest.id).toBe(s.id)
      expect(s.manifest.version).toMatch(/^\d+\.\d+\.\d+$/)
      expect(s.manifest.componentFile).toMatch(/\.tsx?$/)
    }
  })
})


describe('loadSectionFromDir', () => {
  it('loads a single section by directory path', async () => {
    const dir = resolve(SECTIONS_ROOT, 'hero/HeroSplit')
    const loaded = await loadSectionFromDir(dir)
    expect(loaded.id).toBe('HeroSplit')
    expect(loaded.manifest.category).toBe('hero')
    expect(loaded.manifest.density).toBe('spacious')
    expect(loaded.manifest.props.headline.required).toBe(true)
    expect(loaded.manifest.bestWithThemes).toContain('minimal')
  })

  it('throws WIRER_TEMPLATE_MISSING when section.yaml absent', async () => {
    await expect(
      loadSectionFromDir('/tmp/no-section-here-12345'),
    ).rejects.toThrow(/section\.yaml/)
  })
})
