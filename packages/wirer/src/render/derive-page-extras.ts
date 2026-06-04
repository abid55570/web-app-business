/**
 * Sprint 7b — append user-picked sections to hand-rendered auth/extra pages.
 *
 * Reads `recipe.pageExtras` (a map of pageId → section IDs[]) and rewrites
 * each target page.tsx in the tempDir to:
 *   1. Import each listed section component
 *   2. Render each section JSX inside the page's <main>, right before </main>
 *
 * Why "append below the existing content" rather than prepend or replace:
 *   - Auth pages need the form to remain functional; user wants to ADD
 *     marketing/social sections around it, not delete the form.
 *   - Appending preserves the page's existing layout + responsive logic.
 *   - User can always reorder via the section list in Studio's right rail
 *     (drag handles work the same as on the home page).
 *
 * Runs AFTER derive-auth-pages + derive-extra-pages (so target files exist)
 * and BEFORE derive-element-ids (so injected sections get element-IDs too).
 */
import { readFile, writeFile } from 'node:fs/promises'
import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'
import type { WirePlan } from '../types.js'
import { renderSection, type Branding } from './derive-page.js'

export type DerivePageExtrasArgs = {
  plan: WirePlan
  outputDir: string
  /** Path to the catalog's sections root so unknown sections can synthesise
   *  defaults from their section.yaml. Same one passed to derivePage. */
  sectionsRoot?: string
}

export async function derivePageExtras(args: DerivePageExtrasArgs): Promise<{ pagesPatched: number; sectionsInjected: number }> {
  const recipe = args.plan.resolvedRecipe.recipe as {
    pageExtras?: Record<string, string[]>
    branding?: { name?: string; tagline?: string; primary?: string }
  }
  const extras = recipe.pageExtras

  const appRoot = path.join(args.outputDir, 'frontend', 'src', 'app')
  let pagesPatched = 0
  let sectionsInjected = 0

  const branding: Branding = {
    name: recipe.branding?.name || 'My App',
    tagline: recipe.branding?.tagline,
    primary: recipe.branding?.primary,
  }

  // Process every page file: we must visit pages WITHOUT entries too so that
  // any prior injection block gets cleaned up when the user removes everything.
  const candidatePageIds = collectPageIds(appRoot)
  const allTargetIds = new Set<string>([
    ...candidatePageIds,
    ...Object.keys(extras ?? {}),
  ])

  for (const pageId of allTargetIds) {
    if (pageId === 'home') continue // home goes through derivePage, not extras
    const sections = (extras ?? {})[pageId] ?? []

    const pageFile = pageFileFromPageId(pageId, appRoot)
    if (!pageFile) continue

    const before = await readFile(pageFile, 'utf-8')
    const renderedJsxParts = sections.length > 0
      ? await Promise.all(sections.map((sid) => renderSection(sid, branding, args.sectionsRoot)))
      : []
    const after = injectSections(before, sections, renderedJsxParts)
    if (after === before) continue
    await writeFile(pageFile, after, 'utf-8')
    pagesPatched++
    sectionsInjected += sections.length
  }

  return { pagesPatched, sectionsInjected }
}

/** Walk app/ for every page.tsx and return its pageId. */
function collectPageIds(appRoot: string): string[] {
  const out: string[] = []
  function walk(dir: string, relSegs: string[]): void {
    let entries: import('node:fs').Dirent[]
    try {
      entries = readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const e of entries) {
      if (e.name.startsWith('.')) continue
      const abs = path.join(dir, e.name)
      if (e.isDirectory()) walk(abs, [...relSegs, e.name])
      else if (e.isFile() && e.name === 'page.tsx') {
        if (relSegs.length === 0) out.push('home')
        else {
          const cleaned = relSegs
            .filter((s) => !/^\(.*\)$/.test(s))
            .map((s) => s.replace(/^\[\.\.\.(.+)\]$/, '$1').replace(/^\[(.+)\]$/, '$1'))
            .filter(Boolean)
          out.push(cleaned.length === 0 ? 'home' : cleaned.join('-'))
        }
      }
    }
  }
  walk(appRoot, [])
  return out
}

/** Resolve a pageId to its page.tsx path. Mirrors apply-overrides logic.
 *    'home'      → app/page.tsx
 *    'signup'    → app/signup/page.tsx
 *    'blog-slug' → app/blog/[slug]/page.tsx OR app/blog/slug/page.tsx
 */
function pageFileFromPageId(pageId: string, appRoot: string): string | null {
  if (pageId === 'home') {
    const p = path.join(appRoot, 'page.tsx')
    return existsSync(p) ? p : null
  }
  const literal = path.join(appRoot, ...pageId.split('-'), 'page.tsx')
  if (existsSync(literal)) return literal
  const single = path.join(appRoot, pageId, 'page.tsx')
  if (existsSync(single)) return single
  return null
}

/** Modify a page.tsx source to import + render the given sections inside <main>.
 *
 *   1. After the last `import ...` line, insert one import per section:
 *        import { Hero3DScene } from '@/sections/Hero3DScene/Hero3DScene'
 *   2. Find the LAST `</main>` close tag in the file. Inject section JSX
 *      directly before it, wrapped in a marker div for idempotent regen.
 *   3. If a previous marker div is present (from prior regen), replace its
 *      content entirely so removed sections actually disappear.
 *
 *   Idempotent — running twice with the same sections list yields the same
 *   output. Running with a different list cleanly replaces the marker block.
 */
function injectSections(src: string, sections: string[], renderedJsxParts: string[] = []): string {
  const MARKER_OPEN = '{/* b-dash:page-extras:start */}'
  const MARKER_CLOSE = '{/* b-dash:page-extras:end */}'

  // ── 1. Strip any prior marker block ─────────────────────────────
  let stripped = src
  const oldOpen = stripped.indexOf(MARKER_OPEN)
  if (oldOpen >= 0) {
    const oldClose = stripped.indexOf(MARKER_CLOSE, oldOpen)
    if (oldClose >= 0) {
      // Drop everything between (inclusive of markers + trailing newline)
      let end = oldClose + MARKER_CLOSE.length
      if (stripped[end] === '\n') end++
      stripped = stripped.slice(0, oldOpen) + stripped.slice(end)
    }
  }

  // Also strip any prior auto-injected imports (marked with /* b-dash:page-extras-import */)
  stripped = stripped.replace(/^import [^\n]* \/\* b-dash:page-extras-import \*\/\n/gm, '')

  if (sections.length === 0) {
    return stripped
  }

  // ── 2. Build new import lines + JSX block ───────────────────────
  const uniqueSections = Array.from(new Set(sections))
  // React import needed for `as React.ComponentProps<typeof X>` casts that
  // renderSection emits in the prop spread.
  const importLines = [
    `import * as React from 'react' /* b-dash:page-extras-import */`,
    ...uniqueSections.map((s) => `import { ${s} } from '@/sections/${s}/${s}' /* b-dash:page-extras-import */`),
  ].join('\n')
  // renderSection emits "<SectionGuard name=...><X .../></SectionGuard>".
  // We don't have SectionGuard available here (it's defined inside home's
  // page.tsx); strip the wrapper and keep just the inner self-closing tag.
  // A render error in the injected section will surface as a normal Next.js
  // error in dev — acceptable for V1; we can add a guard later if needed.
  const sectionJsx = renderedJsxParts
    .map((p) => {
      // Find the inner `<X {...(...)} />` line — everything between the
      // SectionGuard's `>` and the matching `</SectionGuard>`.
      const m = p.match(/<SectionGuard[^>]*>([\s\S]*?)<\/SectionGuard>/)
      return (m ? m[1] : p).trim()
    })
    .map((line) => `        ${line}`)
    .join('\n')
  const block = [
    `      ${MARKER_OPEN}`,
    `      <section className="bd-page-extras">`,
    sectionJsx,
    `      </section>`,
    `      ${MARKER_CLOSE}`,
  ].join('\n')

  // ── 3. Inject imports after the last import line ────────────────
  // Match imports at the top of the file (allowing 'use client' first).
  let withImports = stripped
  const lastImportMatch = [...stripped.matchAll(/^import [^\n]+$/gm)].pop()
  if (lastImportMatch) {
    const insertAt = lastImportMatch.index! + lastImportMatch[0].length
    withImports = stripped.slice(0, insertAt) + '\n' + importLines + stripped.slice(insertAt)
  } else {
    // No imports — prepend to file (after 'use client' if present)
    const useClientMatch = /^['"]use client['"];?\s*\n/.exec(stripped)
    const insertAt = useClientMatch ? useClientMatch[0].length : 0
    withImports = stripped.slice(0, insertAt) + importLines + '\n' + stripped.slice(insertAt)
  }

  // ── 4. Inject JSX block before the LAST </main> ─────────────────
  const lastMainClose = withImports.lastIndexOf('</main>')
  if (lastMainClose < 0) {
    // No </main> — page is structured differently. Bail out cleanly.
    return withImports
  }
  return withImports.slice(0, lastMainClose) + block + '\n      ' + withImports.slice(lastMainClose)
}
