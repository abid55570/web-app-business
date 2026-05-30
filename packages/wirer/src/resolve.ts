/**
 * Resolve a recipe against the on-disk module + theme inventory, then
 * topologically sort the modules so dependencies are wired before dependents.
 */
import type { Recipe } from '@b-dash/schemas'
import { WirerError } from './errors.js'
import type {
  LoadedModule,
  LoadedTheme,
  ResolvedModuleEntry,
  ResolvedRecipe,
} from './types.js'

function buildContractProviderMap(
  modules: ResolvedModuleEntry[],
): Map<string, string[]> {
  const out = new Map<string, string[]>()
  for (const m of modules) {
    for (const contract of m.manifest.implements) {
      const list = out.get(contract) ?? []
      list.push(m.id)
      out.set(contract, list)
    }
  }
  return out
}

/**
 * Topological sort of modules by their `depends_on` contracts.
 *
 * Algorithm: Kahn's. Cycles surface as `WIRER_CYCLE_DETECTED`. Ties resolve
 * alphabetically by module ID for deterministic output.
 */
export function topologicalSort(
  modules: ResolvedModuleEntry[],
): ResolvedModuleEntry[] {
  if (modules.length === 0) return []

  const moduleById = new Map(modules.map((m) => [m.id, m]))
  const providers = buildContractProviderMap(modules)
  const inDegree = new Map<string, number>()
  const adj = new Map<string, Set<string>>()

  for (const m of modules) {
    inDegree.set(m.id, 0)
    adj.set(m.id, new Set())
  }

  // Edge: provider -> dependent (so providers sort before dependents).
  for (const m of modules) {
    for (const contract of m.manifest.depends_on) {
      const providerIds = providers.get(contract) ?? []
      for (const pId of providerIds) {
        if (pId === m.id) continue
        const adjSet = adj.get(pId)
        if (adjSet && !adjSet.has(m.id)) {
          adjSet.add(m.id)
          inDegree.set(m.id, (inDegree.get(m.id) ?? 0) + 1)
        }
      }
    }
  }

  const queue: string[] = []
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id)
  }
  queue.sort()

  const sorted: ResolvedModuleEntry[] = []
  while (queue.length > 0) {
    const id = queue.shift() as string
    const m = moduleById.get(id)
    if (m) sorted.push(m)
    for (const next of adj.get(id) ?? []) {
      const newDeg = (inDegree.get(next) ?? 0) - 1
      inDegree.set(next, newDeg)
      if (newDeg === 0) queue.push(next)
    }
    queue.sort()
  }

  if (sorted.length !== modules.length) {
    const sortedIds = new Set(sorted.map((m) => m.id))
    const cyclic = modules.filter((m) => !sortedIds.has(m.id)).map((m) => m.id)
    throw new WirerError(
      'WIRER_CYCLE_DETECTED',
      `Module dependency cycle detected among: ${cyclic.join(', ')}`,
      { cyclic },
    )
  }

  return sorted
}

export type ResolveOptions = {
  recipe: Recipe
  modules: LoadedModule[]
  themes: LoadedTheme[]
}

/**
 * Look up every recipe.modules entry against the on-disk inventory, look up
 * the theme pack, and return a topologically-sorted ResolvedRecipe.
 *
 * Throws `WIRER_TEMPLATE_MISSING` if a referenced module or theme isn't on disk.
 * Throws `WIRER_CYCLE_DETECTED` if module dependencies form a cycle.
 */
export function resolveRecipe(opts: ResolveOptions): ResolvedRecipe {
  const { recipe, modules, themes } = opts

  // Theme
  const theme = themes.find((t) => t.pack === recipe.theme.pack)
  if (!theme) {
    throw new WirerError(
      'WIRER_TEMPLATE_MISSING',
      `Theme pack '${recipe.theme.pack}' not found. Available: ${themes
        .map((t) => t.pack)
        .join(', ') || '(none)'}`,
      {
        requested: recipe.theme.pack,
        available: themes.map((t) => t.pack),
      },
    )
  }

  // Modules
  const modulesById = new Map(modules.map((m) => [m.id, m]))
  const resolved: ResolvedModuleEntry[] = []
  for (const entry of recipe.modules) {
    const loaded = modulesById.get(entry.id)
    if (!loaded) {
      throw new WirerError(
        'WIRER_TEMPLATE_MISSING',
        `Module '${entry.id}' not found. Available: ${modules
          .map((m) => m.id)
          .join(', ') || '(none)'}`,
        {
          requested: entry.id,
          available: modules.map((m) => m.id),
        },
      )
    }
    resolved.push({
      id: entry.id,
      version: entry.version,
      config: entry.config,
      manifest: loaded.manifest,
      manifestPath: loaded.manifestPath,
    })
  }

  return {
    recipe,
    modules: topologicalSort(resolved),
    theme,
  }
}
