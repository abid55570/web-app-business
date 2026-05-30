import type { Module, Recipe, ThemeManifest, Tokens } from '@b-dash/schemas'

/** A module discovered on disk and validated against ModuleSchema. */
export type LoadedModule = {
  id: string
  manifest: Module
  manifestPath: string
}

/** A theme pack discovered on disk: manifest + light tokens (+ optional dark). */
export type LoadedTheme = {
  pack: string
  manifest: ThemeManifest
  manifestPath: string
  tokens: Tokens
  darkTokens: Tokens | null
}

/** A recipe entry resolved against an actual on-disk module. */
export type ResolvedModuleEntry = {
  id: string
  version: string
  config: Record<string, unknown>
  manifest: Module
  manifestPath: string
}

/** A recipe resolved against the on-disk module + theme inventory. */
export type ResolvedRecipe = {
  recipe: Recipe
  /** Modules in topological order — depends_on providers come BEFORE dependents. */
  modules: ResolvedModuleEntry[]
  theme: LoadedTheme
}

/** A file path two or more modules want to write — see PLAN §58.2. */
export type FileConflict = {
  path: string
  contributors: string[]
}

/** The full wire plan: resolved recipe + cross-module index. */
export type WirePlan = {
  resolvedRecipe: ResolvedRecipe
  /** event_id -> [moduleId, ...] */
  emitters: Record<string, string[]>
  /** event_id -> [moduleId, ...] */
  subscribers: Record<string, string[]>
  /** Sorted union of permissions declared by all modules. */
  permissions: string[]
  /** Detected file conflicts (empty if the plan is clean). */
  conflicts: FileConflict[]
}
