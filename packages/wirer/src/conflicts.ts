/**
 * Detect file conflicts between modules — see PLAN §58.2.
 *
 * Phase 1 MVP only inspects `ui_contributions.pages` (the obvious case where
 * two modules try to own the same route). When the wirer's render step ships
 * (Phase 1 Chunk C / B3), this will expand to all generated paths.
 */
import type { FileConflict, ResolvedRecipe } from './types.js'

export function detectFileConflicts(resolved: ResolvedRecipe): FileConflict[] {
  const pageContributors = new Map<string, string[]>()

  for (const m of resolved.modules) {
    for (const page of m.manifest.ui_contributions.pages) {
      const list = pageContributors.get(page.path) ?? []
      list.push(m.id)
      pageContributors.set(page.path, list)
    }
  }

  const conflicts: FileConflict[] = []
  for (const [pagePath, contributors] of pageContributors) {
    if (contributors.length > 1) {
      conflicts.push({ path: pagePath, contributors: [...contributors].sort() })
    }
  }
  return conflicts.sort((a, b) => a.path.localeCompare(b.path))
}
