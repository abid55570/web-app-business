/**
 * Lightweight fuzzy match for the palette search input.
 *
 * Scoring rules (higher = better):
 *   +100  prefix match on the displayName
 *   +50   substring match in displayName
 *   +20   substring match in category
 *   +10   substring match in any tag (each)
 *   +2    per matched character with the right ordering
 *
 * 0 = no match (caller filters out).
 */
export type FuzzyTarget = {
  id: string
  displayName: string
  category: string
  description?: string
  tags?: string[]
}

export function fuzzyScore(target: FuzzyTarget, query: string): number {
  const q = query.trim().toLowerCase()
  if (!q) return 1
  let score = 0

  const name = target.displayName.toLowerCase()
  if (name.startsWith(q)) score += 100
  else if (name.includes(q)) score += 50

  if (target.category.toLowerCase().includes(q)) score += 20

  for (const t of target.tags ?? []) {
    if (t.toLowerCase().includes(q)) score += 10
  }

  // Character-order bonus — rewards "hbg" matching "Hero Bg Grid".
  let qi = 0
  for (const ch of name) {
    if (ch === q[qi]) {
      qi += 1
      score += 2
      if (qi === q.length) break
    }
  }

  return score
}

export function fuzzyFilter<T extends FuzzyTarget>(
  items: T[],
  query: string,
): T[] {
  if (!query.trim()) return items
  return items
    .map((it) => ({ it, score: fuzzyScore(it, query) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.it)
}
