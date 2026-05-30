/**
 * Top-level StudioConfig — the JSON the editor frontend loads at boot.
 *
 * Combines:
 *   - Block manifests (from `buildAllBlockManifests`)
 *   - Theme tokens (passed through verbatim — the editor needs them
 *     to render previews accurately)
 *   - Page list (initial routes Studio shows in its Pages panel)
 *
 * Persisted to `<project>/studio.config.json` at render time so the
 * customer's Studio session always reflects the current generated app.
 */
import type { Tokens } from '@b-dash/schemas'

import type { PuckBlockManifest } from './blocks.js'


export type StudioConfig = {
  /** All blocks the editor's component palette can drop. */
  blocks: PuckBlockManifest[]
  /** Theme tokens for the live-preview iframe. */
  themeTokens: Tokens | null
  /** Initial page list — paths surface in the Pages panel; new pages
   * created in Studio append here. */
  pages: Array<{ path: string; layout: string }>
  /** Wirer render version this config was generated against. Editor
   * uses this to flag stale configs after a regen. */
  generatedAtRenderVersion: string
}


export function buildStudioConfig(args: {
  blocks: PuckBlockManifest[]
  themeTokens?: Tokens | null
  pages?: Array<{ path: string; layout: string }>
  renderVersion: string
}): StudioConfig {
  return {
    blocks: args.blocks,
    themeTokens: args.themeTokens ?? null,
    pages: args.pages ?? [],
    generatedAtRenderVersion: args.renderVersion,
  }
}
