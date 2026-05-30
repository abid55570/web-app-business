/**
 * Illustration pack manifest — declares a themed bundle of SVG/PNG illustrations
 * (e.g. empty-states, error pages, onboarding spots) that Studio + starters
 * can drop into a generated app. Packs live at
 * ``illustrations/<pack-id>/pack.yaml`` + sibling asset files.
 *
 * Phase 11 wave 23 ships the foundational schema. Subsequent waves
 * fill out the 8-pack year-1 catalog target.
 */
import { z } from 'zod'

export const ILLUSTRATION_PACK_STYLES = [
  'flat',
  'isometric',
  'line',
  'duotone',
  'sketch',
  'lowpoly',
  'spot',
] as const

export const ILLUSTRATION_PACK_CATEGORIES = [
  'empty-state',
  'error',
  'onboarding',
  'success',
  'marketing',
  'avatar',
  'decorative',
  'mixed',
] as const

export const IllustrationAssetSchema = z.object({
  /** kebab-case asset id within the pack, e.g. "empty-inbox". */
  id: z.string().regex(/^[a-z][a-z0-9-]*$/),
  /** Filename relative to pack dir, e.g. "./empty-inbox.svg". */
  file: z.string().min(1),
  description: z.string().optional(),
  /** Tags help Studio's search surface the right asset. */
  tags: z.array(z.string()).default([]),
})

export const IllustrationPackSchema = z.object({
  /** kebab-case pack id, e.g. "spot-empty-states". */
  id: z.string().regex(/^[a-z][a-z0-9-]*$/),
  displayName: z.string().min(1),
  description: z.string().optional(),
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, 'must be semver'),

  style: z.enum(ILLUSTRATION_PACK_STYLES),
  category: z.enum(ILLUSTRATION_PACK_CATEGORIES),

  /** Themes that pair well visually with this pack. */
  themeAffinity: z.array(z.string()).default([]),

  /** Optional license string, e.g. "MIT", "CC0", "proprietary". */
  license: z.string().default('MIT'),

  assets: z.array(IllustrationAssetSchema).min(1),

  deprecated: z.boolean().default(false),
})

export type IllustrationAsset = z.infer<typeof IllustrationAssetSchema>
export type IllustrationPack = z.infer<typeof IllustrationPackSchema>
export type IllustrationStyle = (typeof ILLUSTRATION_PACK_STYLES)[number]
export type IllustrationCategory = (typeof ILLUSTRATION_PACK_CATEGORIES)[number]
