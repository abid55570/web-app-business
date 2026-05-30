/**
 * @b-dash/wirer — load modules + themes, resolve recipes, build a wire plan.
 *
 * Public API (Phase 1 Chunk B — pre-render):
 *   loadModuleFromDir, loadThemeFromDir, scanModules, scanThemes
 *   resolveRecipe, topologicalSort, checkCompatibility, detectFileConflicts
 *   buildWirePlan (top-level convenience)
 *   WirerError, WirerErrorCode
 *   Types: LoadedModule, LoadedTheme, ResolvedModuleEntry, ResolvedRecipe,
 *          FileConflict, WirePlan
 */
import type { Recipe } from '@b-dash/schemas'
import { checkCompatibility } from './compatibility.js'
import { detectFileConflicts } from './conflicts.js'
import { resolveRecipe } from './resolve.js'
import type { LoadedModule, LoadedTheme, WirePlan } from './types.js'

export {
  loadModuleFromDir,
  loadThemeFromDir,
  scanModules,
  scanThemes,
} from './load.js'

export { resolveRecipe, topologicalSort } from './resolve.js'
export { checkCompatibility } from './compatibility.js'
export { detectFileConflicts } from './conflicts.js'
export { render, type RenderOptions, type RenderResult } from './render/index.js'
export { copyModuleFiles, type CopyModuleArgs, type CopiedFile } from './render/copy-module.js'
export { promote, rollback } from './render/promote.js'
export {
  overlayOverrides,
  readOverridesManifest,
  type OverlaidFile,
  type OverlayResult,
} from './render/overlay-overrides.js'
export {
  deriveDeploy,
  type DeployArtifact,
  type DeployResult,
} from './render/derive-deploy.js'
export {
  buildUpgradeReport,
  parseChangelog,
  compareVersions,
  type BuildArgs as ChangelogBuildArgs,
  type ChangelogEntry,
  type ModuleBump,
  type Severity,
  type UpgradeReport,
} from './render/changelog.js'
export { WirerError, type WirerErrorCode } from './errors.js'

export type {
  LoadedModule,
  LoadedTheme,
  ResolvedModuleEntry,
  ResolvedRecipe,
  WirePlan,
  FileConflict,
} from './types.js'

/**
 * Top-level: build a complete wire plan for a recipe against the on-disk
 * inventory of modules + themes.
 *
 * Steps (per PLAN §19.1 stages 1-3, plus event/permission indexing):
 *   1. resolveRecipe — look up modules + theme, sort topologically
 *   2. checkCompatibility — verify dependencies + incompatibilities
 *   3. Index emitters / subscribers / permissions across all enabled modules
 *   4. detectFileConflicts — flag obvious page collisions
 */
export function buildWirePlan(args: {
  recipe: Recipe
  modules: LoadedModule[]
  themes: LoadedTheme[]
}): WirePlan {
  const resolvedRecipe = resolveRecipe(args)
  checkCompatibility(resolvedRecipe)

  const emitters: Record<string, string[]> = {}
  const subscribers: Record<string, string[]> = {}
  const permissions = new Set<string>()

  for (const m of resolvedRecipe.modules) {
    for (const e of m.manifest.emits) {
      ;(emitters[e.id] ??= []).push(m.id)
    }
    for (const s of m.manifest.subscribes) {
      ;(subscribers[s.id] ??= []).push(m.id)
    }
    for (const p of m.manifest.permissions) {
      permissions.add(p)
    }
  }

  return {
    resolvedRecipe,
    emitters,
    subscribers,
    permissions: [...permissions].sort(),
    conflicts: detectFileConflicts(resolvedRecipe),
  }
}
