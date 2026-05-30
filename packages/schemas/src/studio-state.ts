/**
 * Studio state — cosmetic edits the builder writes. Lives at the customer's
 * project root as ``studio-state.json`` (sibling of ``recipe.json``).
 *
 * PLAN §15: two-mode persistence. Anything cosmetic (block prop tweaks,
 * page-level layout reordering) goes here; anything structural (modules
 * added/removed, permissions changed) goes through recipe.json + regen.
 *
 * Schema is forgiving — Studio writes incrementally as the operator drags
 * + edits, and the wirer reads on next render to apply the overlays.
 */
import { z } from 'zod'

/** Recursive shape — children are themselves BlockInstance trees.
 * Explicit type annotation needed for tsup's DTS pass to handle z.lazy. */
export type BlockInstance = {
  instanceId: string
  blockId: string
  sourceModuleId: string
  props: Record<string, unknown>
  children: BlockInstance[]
}

export const BlockInstanceSchema: z.ZodType<BlockInstance, z.ZodTypeDef, unknown> = z.lazy(() =>
  z.object({
    /** Stable id assigned by Studio when the block lands on a page. */
    instanceId: z.string().min(1),
    /** Block manifest id (PascalCase — matches StudioBlockManifest.id). */
    blockId: z.string().min(1),
    /** Source module that ships this block (so wirer can find the component). */
    sourceModuleId: z.string().min(1),
    /** Operator-edited prop values. Validated against the block's PropDef
     * map at write time; missing props fall back to PropDef.default. */
    props: z.record(z.unknown()).default({}),
    /** Nested children (when block.hasChildren=true). Cycles are rejected. */
    children: z.array(BlockInstanceSchema).default([]),
  }),
)

export const PageStateSchema = z.object({
  /** Route path the page mounts at (matches ui_contributions.pages[].path). */
  path: z.string().min(1),
  /** Top-level block instances rendered on this page in DOM order. */
  blocks: z.array(BlockInstanceSchema).default([]),
  /** Per-page metadata override (title, og image, robots). */
  meta: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      ogImage: z.string().optional(),
      robots: z.string().optional(),
    })
    .optional(),
})

export const StudioStateSchema = z.object({
  /** Schema version for migration. Bump on breaking changes. */
  schemaVersion: z.literal('1.0.0'),
  /** Recipe id this state belongs to — wirer cross-checks at apply time. */
  recipeId: z.string().min(1),
  /** ISO timestamp of the last Studio write. */
  updatedAt: z.string().datetime(),
  /** Cosmetic theme overrides — partial token map merged over the
   * theme pack's tokens.json at render time. */
  themeOverrides: z
    .object({
      colors: z.record(z.unknown()).optional(),
      typography: z.record(z.unknown()).optional(),
      spacing: z.record(z.unknown()).optional(),
      radius: z.record(z.unknown()).optional(),
    })
    .optional(),
  /** Per-page block trees keyed by route path. */
  pages: z.record(PageStateSchema).default({}),
})

export type PageState = z.infer<typeof PageStateSchema>
export type StudioState = z.infer<typeof StudioStateSchema>
