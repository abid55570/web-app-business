/**
 * Free-text intent matcher.
 *
 * Maps a user's "I want a todo app for my team" sentence to a starter
 * template id by scoring keyword overlap. Fully deterministic — no
 * LLM, no network.
 *
 * Returns the top 3 matches with scores. If the sentence is empty or
 * matches nothing strongly, defaults to 'blank'.
 */

const KEYWORDS: Record<string, { templateId: string; weight: number }[]> = {
  todo: [{ templateId: 'todo', weight: 10 }],
  task: [{ templateId: 'todo', weight: 8 }],
  notes: [{ templateId: 'todo', weight: 6 }],
  productivity: [{ templateId: 'todo', weight: 4 }],
  checklist: [{ templateId: 'todo', weight: 6 }],

  saas: [{ templateId: 'landing', weight: 8 }, { templateId: 'pricing', weight: 4 }],
  startup: [{ templateId: 'landing', weight: 6 }],
  product: [{ templateId: 'landing', weight: 4 }, { templateId: 'shop', weight: 3 }],
  landing: [{ templateId: 'landing', weight: 10 }],
  marketing: [{ templateId: 'landing', weight: 6 }],

  pricing: [{ templateId: 'pricing', weight: 10 }, { templateId: 'landing', weight: 2 }],
  subscription: [{ templateId: 'pricing', weight: 6 }],
  plan: [{ templateId: 'pricing', weight: 4 }],
  tier: [{ templateId: 'pricing', weight: 4 }],

  blog: [{ templateId: 'blog', weight: 10 }],
  writing: [{ templateId: 'blog', weight: 6 }],
  newsletter: [{ templateId: 'blog', weight: 4 }, { templateId: 'landing', weight: 2 }],
  publication: [{ templateId: 'blog', weight: 6 }],
  article: [{ templateId: 'blog', weight: 4 }],

  portfolio: [{ templateId: 'portfolio', weight: 10 }],
  freelance: [{ templateId: 'portfolio', weight: 6 }],
  designer: [{ templateId: 'portfolio', weight: 4 }],
  photographer: [{ templateId: 'portfolio', weight: 6 }],
  artist: [{ templateId: 'portfolio', weight: 4 }],
  resume: [{ templateId: 'portfolio', weight: 6 }],
  cv: [{ templateId: 'portfolio', weight: 4 }],

  shop: [{ templateId: 'shop', weight: 10 }],
  store: [{ templateId: 'shop', weight: 10 }],
  ecommerce: [{ templateId: 'shop', weight: 10 }],
  sell: [{ templateId: 'shop', weight: 6 }],
  buy: [{ templateId: 'shop', weight: 4 }],
  cart: [{ templateId: 'shop', weight: 6 }],
  checkout: [{ templateId: 'shop', weight: 6 }],

  event: [{ templateId: 'event', weight: 10 }],
  conference: [{ templateId: 'event', weight: 8 }],
  meetup: [{ templateId: 'event', weight: 6 }],
  wedding: [{ templateId: 'event', weight: 8 }],
  rsvp: [{ templateId: 'event', weight: 6 }],
  ticket: [{ templateId: 'event', weight: 4 }],
}

export type IntentMatch = { templateId: string; score: number; matchedKeywords: string[] }

export function matchIntent(text: string): IntentMatch[] {
  const words = text.toLowerCase().split(/[^a-z]+/).filter(Boolean)
  const scores = new Map<string, { score: number; matched: Set<string> }>()
  for (const w of words) {
    const entries = KEYWORDS[w]
    if (!entries) continue
    for (const { templateId, weight } of entries) {
      const cur = scores.get(templateId) ?? { score: 0, matched: new Set() }
      cur.score += weight
      cur.matched.add(w)
      scores.set(templateId, cur)
    }
  }
  const ranked: IntentMatch[] = Array.from(scores.entries())
    .map(([templateId, { score, matched }]) => ({
      templateId,
      score,
      matchedKeywords: Array.from(matched),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
  return ranked
}
