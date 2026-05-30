/**
 * Section manifest — declares a reusable UI block (Hero, FeatureGrid,
 * PricingTable, CTA, Footer...) the wirer can copy into a generated app
 * and Studio can drag onto pages. Sections live at
 * ``sections/<category>/<id>/section.yaml`` + sibling component file.
 *
 * Phase 5 wave 1 ships a small starter set covering the highest-impact
 * layouts; later waves fill out PLAN's 100-section catalog target.
 */
import { z } from 'zod'
import { PropDefSchema } from './studio-block.js'

export const SECTION_CATEGORIES = [
  'hero',
  'features',
  'pricing',
  'cta',
  'footer',
  'header',
  'testimonials',
  'logos',
  'faq',
  'gallery',
  'stats',
  'team',
  'content',
  'forms',
  'comparison',
  'banner',
  'newsletter',
  'timeline',
  'process',
  'quote',
  'divider',
  'breadcrumb',
  'sidebar',
  'error',
  'empty',
  'table',
  'loading',
  'coming-soon',
  'notice',
  'contact',
  'download',
  'blog',
  'product',
  'profile',
  'feedback',
  'layout',
  'metric',
  'maps',
  'charts',
  'modal',
  'nav',
  'onboarding',
  'search',
  '3d',
  'illustration',
] as const

export const SECTION_DENSITIES = [
  'compact',
  'dense',
  'normal',
  'comfortable',
  'spacious',
] as const
export const RESPONSIVE_VARIANTS = ['mobile-first', 'desktop-first'] as const

export const SectionSchema = z.object({
  /** PascalCase id — e.g. "HeroSplit", "FeatureGrid3Col". */
  id: z.string().regex(/^[A-Z][A-Za-z0-9]*$/, 'Section id must be PascalCase'),
  displayName: z.string().min(1),
  description: z.string().optional(),
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, 'must be semver'),

  category: z.enum(SECTION_CATEGORIES),
  density: z.enum(SECTION_DENSITIES).default('normal'),
  responsive: z.enum(RESPONSIVE_VARIANTS).default('mobile-first'),

  /** Path to the React component, relative to this section.yaml.
   * E.g. "./HeroSplit.tsx". Wirer copies it to
   * <out>/frontend/src/sections/<id>/<basename>. */
  componentFile: z.string().min(1),

  /** Editable props the section exposes — same shape as Studio block manifest. */
  props: z.record(PropDefSchema).default({}),

  /** Tags for the gallery filter UI. */
  tags: z.array(z.string()).default([]),

  /** Themes the section is known to look good in. Empty = theme-agnostic. */
  bestWithThemes: z.array(z.string()).default([]),

  /** Optional preview image (path relative to section.yaml). */
  preview: z.string().optional(),

  deprecated: z.boolean().default(false),
})

export type SectionCategory = (typeof SECTION_CATEGORIES)[number]
export type SectionDensity = (typeof SECTION_DENSITIES)[number]
export type ResponsiveVariant = (typeof RESPONSIVE_VARIANTS)[number]
export type Section = z.infer<typeof SectionSchema>
