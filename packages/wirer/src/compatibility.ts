/**
 * Compatibility checking for a resolved recipe.
 *
 *   - Every `depends_on` contract MUST be provided by another module in the recipe.
 *   - No two modules in the recipe may declare each other in `incompatible_with`.
 */
import { WirerError } from './errors.js'
import type { ResolvedRecipe } from './types.js'

export function checkCompatibility(resolved: ResolvedRecipe): void {
  const { modules } = resolved
  const moduleIds = new Set(modules.map((m) => m.id))

  // Build contract -> [modules providing it] from the recipe (not the global pool).
  const providers = new Map<string, string[]>()
  for (const m of modules) {
    for (const contract of m.manifest.implements) {
      const list = providers.get(contract) ?? []
      list.push(m.id)
      providers.set(contract, list)
    }
  }

  // Required contracts must have at least one provider in the recipe.
  for (const m of modules) {
    for (const contract of m.manifest.depends_on) {
      const list = providers.get(contract) ?? []
      if (list.length === 0) {
        throw new WirerError(
          'RECIPE_MISSING_PROVIDER',
          `Module '${m.id}' depends on contract '${contract}' but no module in the recipe provides it.`,
          { module: m.id, contract },
        )
      }
    }
  }

  // No mutual incompatibilities.
  for (const m of modules) {
    for (const incompatId of m.manifest.incompatible_with) {
      if (moduleIds.has(incompatId)) {
        throw new WirerError(
          'RECIPE_INCOMPATIBLE',
          `Module '${m.id}' is incompatible with '${incompatId}', but both are in the recipe.`,
          { module: m.id, incompatibleWith: incompatId },
        )
      }
    }
  }
}
