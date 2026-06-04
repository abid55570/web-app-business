/**
 * Apply Studio v2 element-level overrides to copied section files.
 *
 * Reads `<outputDir>/studio-overrides.json` (written by the Studio
 * editor when the user inline-edits in the iframe) + patches each
 * matching `[data-bd-element="<id>"]` JSX element inside the copied
 * `<out>/frontend/src/sections/*.tsx` files.
 *
 * studio-overrides.json shape:
 *   {
 *     "version": 1,
 *     "elements": {
 *       "Hero3DScene:e6": { "text": "Try it now" },
 *       "CtaMagnetic:e2": { "text": "Sign me up", "className": "..." }
 *     }
 *   }
 *
 * Patch model — Sprint 2b:
 *   - text: replace JSX text content between the matching opening and
 *     closing tag, only when the original element wraps a simple text
 *     literal (no JSX expressions, no nested elements). Skipped
 *     otherwise so we don't garble e.g. <h1>{headline}</h1>.
 *
 * Sprint 2c will add className + image patching.
 *
 * Runs AFTER derive-element-ids (so the data-bd-element attrs exist)
 * and BEFORE promote (so the temp dir gets the patches). No-op when
 * the overrides file is missing.
 */
import { existsSync } from 'node:fs'
import { readFile, readdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

export type DeriveApplyOverridesArgs = {
  outputDir: string
}

export type Overrides = {
  version: 1
  elements: Record<string, ElementPatch>
}
export type ElementPatch = {
  /** Replace pure-text content of the targeted element. */
  text?: string
  /** Replace the className attribute value of the targeted element. */
  className?: string
  /** Set / replace JSX attributes by name. Sprint 2c — used for
   *  src (images), href (links), alt, and other static attributes.
   *  Skipped for attributes whose current value is a JSX expression
   *  (e.g. src={imageUrl}) — Sprint 3 will surface those as prop
   *  bindings on the parent section. */
  attributes?: Record<string, string>
}

export async function readOverrides(outputDir: string): Promise<Overrides | null> {
  const p = path.join(outputDir, 'studio-overrides.json')
  try {
    const st = await stat(p)
    if (!st.isFile()) return null
    const raw = await readFile(p, 'utf-8')
    const json = JSON.parse(raw) as Overrides
    if (!json || json.version !== 1 || !json.elements) return null
    return json
  } catch {
    return null
  }
}

export async function deriveApplyOverrides(args: DeriveApplyOverridesArgs): Promise<{ filesPatched: number; elementsPatched: number }> {
  const overrides = await readOverrides(args.outputDir)
  if (!overrides) return { filesPatched: 0, elementsPatched: 0 }

  // Group overrides by section id (prefix before ':e<n>').
  const bySection: Record<string, Record<string, ElementPatch>> = {}
  for (const [elementId, patch] of Object.entries(overrides.elements)) {
    const idx = elementId.indexOf(':')
    if (idx < 0) continue
    const sectionId = elementId.slice(0, idx)
    bySection[sectionId] ??= {}
    bySection[sectionId][elementId] = patch
  }

  const sectionsRoot = path.join(args.outputDir, 'frontend', 'src', 'sections')
  const appRoot = path.join(args.outputDir, 'frontend', 'src', 'app')
  let filesPatched = 0
  let elementsPatched = 0

  for (const sectionId of Object.keys(bySection)) {
    // Resolve sectionId → file list:
    //   `page-<pageId>` → frontend/src/app/<derived-path>/page.tsx
    //   anything else   → frontend/src/sections/<sectionId>/*.tsx
    let files: string[] = []
    if (sectionId.startsWith('page-')) {
      const pageFile = pageFileFromPageId(sectionId.slice('page-'.length), appRoot)
      if (pageFile) files = [pageFile]
    } else {
      const sectionDir = path.join(sectionsRoot, sectionId)
      try {
        files = (await readdir(sectionDir, { withFileTypes: true }))
          .filter((e) => e.isFile() && e.name.endsWith('.tsx'))
          .map((e) => path.join(sectionDir, e.name))
      } catch {
        continue
      }
    }
    for (const filePath of files) {
      let before: string
      try {
        before = await readFile(filePath, 'utf-8')
      } catch {
        continue
      }
      let after = before
      let patchedHere = 0
      for (const [elementId, patch] of Object.entries(bySection[sectionId]!)) {
        const next = applyPatchToFile(after, elementId, patch)
        if (next !== after) {
          after = next
          patchedHere++
        }
      }
      if (patchedHere > 0) {
        await writeFile(filePath, after, 'utf-8')
        filesPatched++
        elementsPatched += patchedHere

        // ── Sprint 6: keep overrides/<rel> in sync if present ──
        // overlayOverrides runs AFTER promote and copies overrides/<rel>
        // on top of the freshly-promoted output. If an override file
        // exists for this same path (e.g. user previously edited it via
        // the Monaco code editor), it would clobber our patch.
        //
        // Solution: write the patched content to overrides/<rel> too, so
        // the overlay step copies the SAME patched content. No conflict.
        // We only do this when the override already exists — we don't
        // promote an element-patch into a full file override unless the
        // user had already opted into file-level editing for this path.
        const rel = path.relative(args.outputDir, filePath).replace(/\\/g, '/')
        const overridePath = path.join(args.outputDir, 'overrides', rel)
        if (existsSync(overridePath)) {
          // Re-apply patches against the override's current content (it
          // may have other diffs vs the generated version).
          let overrideContent: string
          try {
            overrideContent = await readFile(overridePath, 'utf-8')
          } catch {
            continue
          }
          let overrideAfter = overrideContent
          for (const [elementId, patch] of Object.entries(bySection[sectionId]!)) {
            const next = applyPatchToFile(overrideAfter, elementId, patch)
            if (next !== overrideAfter) overrideAfter = next
          }
          if (overrideAfter !== overrideContent) {
            await writeFile(overridePath, overrideAfter, 'utf-8')
          }
        }
      }
    }
  }

  return { filesPatched, elementsPatched }
}

/** Reverse of derive-element-ids' pageIdFromPath. Pages are unique
 *  enough that we just enumerate candidates and stop at the first one
 *  that exists.
 *    'home'        → app/page.tsx
 *    'signup'      → app/signup/page.tsx
 *    'blog-slug'   → app/blog/[slug]/page.tsx OR app/blog/slug/page.tsx
 *  We don't reverse bracket params perfectly — for Sprint 6 we cover
 *  the auth + extra-page set (none use dynamic params). */
function pageFileFromPageId(pageId: string, appRoot: string): string | null {
  if (pageId === 'home') {
    const p = path.join(appRoot, 'page.tsx')
    return existsSync(p) ? p : null
  }
  // First try literal segs joined with /
  const literal = path.join(appRoot, ...pageId.split('-'), 'page.tsx')
  if (existsSync(literal)) return literal
  // Then try treating pageId as a single dir (e.g. multi-word slug)
  const single = path.join(appRoot, pageId, 'page.tsx')
  if (existsSync(single)) return single
  return null
}

/**
 * Patch one element by id inside one file's source.
 * Returns the modified source (or the original if nothing matched).
 *
 * Strategy:
 *   1. Find the opening tag carrying `data-bd-element="<id>"`.
 *   2. For text patches: if the element wraps a plain text literal
 *      (and only that), swap the literal. Otherwise skip.
 *   3. For className patches: replace the existing className="..."
 *      attribute on the opening tag if present.
 */
function applyPatchToFile(src: string, elementId: string, patch: ElementPatch): string {
  const attr = `data-bd-element="${elementId}"`
  const attrIdx = src.indexOf(attr)
  if (attrIdx < 0) return src

  // Find the opening tag start ('<') by walking left.
  let lt = attrIdx
  while (lt > 0 && src[lt] !== '<') lt--
  if (src[lt] !== '<') return src

  // Find the opening tag end (matching > respecting braces/quotes).
  const gt = findTagOpenEnd(src, lt + 1)
  if (gt < 0) return src

  const openTag = src.slice(lt, gt + 1)
  const isSelfClose = openTag.endsWith('/>')

  let modified = src

  // Patch className=
  if (typeof patch.className === 'string') {
    const cnMatch = /\sclassName=("([^"]*)"|\{`([^`]*)`\}|\{'([^']*)'\})/.exec(openTag)
    if (cnMatch) {
      const newOpen = openTag.replace(cnMatch[0], ` className="${patch.className.replace(/"/g, '&quot;')}"`)
      modified = modified.slice(0, lt) + newOpen + modified.slice(gt + 1)
    } else {
      // No className attr — inject one after the tag name.
      const tagNameMatch = /^<([a-z][a-z0-9]*)/.exec(openTag)
      if (tagNameMatch) {
        const insertAt = lt + 1 + tagNameMatch[1]!.length
        modified = modified.slice(0, insertAt) + ` className="${patch.className.replace(/"/g, '&quot;')}"` + modified.slice(insertAt)
      }
    }
  }

  // Patch static attributes (src, href, alt, etc.). Re-derive offsets
  // since className may have shifted them.
  if (patch.attributes) {
    for (const [name, value] of Object.entries(patch.attributes)) {
      const attrIdxN = modified.indexOf(attr)
      if (attrIdxN < 0) break
      let ltN = attrIdxN
      while (ltN > 0 && modified[ltN] !== '<') ltN--
      const gtN = findTagOpenEnd(modified, ltN + 1)
      if (gtN < 0) break
      const openN = modified.slice(ltN, gtN + 1)
      // Match `name="..."` (skip if `name={...}` — JSX expression)
      const literalRe = new RegExp(`\\s${name}="([^"]*)"`)
      const exprRe = new RegExp(`\\s${name}=\\{`)
      if (exprRe.test(openN)) continue // expression — skip
      const m = literalRe.exec(openN)
      if (m) {
        const newOpen = openN.replace(m[0], ` ${name}="${value.replace(/"/g, '&quot;')}"`)
        modified = modified.slice(0, ltN) + newOpen + modified.slice(gtN + 1)
      } else {
        // No such attr → inject after tag name.
        const tagNameM = /^<([a-z][a-z0-9]*)/.exec(openN)
        if (tagNameM) {
          const insertAt = ltN + 1 + tagNameM[1]!.length
          modified = modified.slice(0, insertAt) + ` ${name}="${value.replace(/"/g, '&quot;')}"` + modified.slice(insertAt)
        }
      }
    }
  }

  // Patch text content. Only safe when element wraps a simple text literal.
  if (typeof patch.text === 'string' && !isSelfClose) {
    // Find content + matching closing tag.
    // Re-derive offsets from `modified` since className may have shifted them.
    const attrIdx2 = modified.indexOf(attr)
    if (attrIdx2 < 0) return modified
    let lt2 = attrIdx2
    while (lt2 > 0 && modified[lt2] !== '<') lt2--
    const gt2 = findTagOpenEnd(modified, lt2 + 1)
    if (gt2 < 0) return modified
    const tagNameMatch = /^<([a-z][a-z0-9]*)/.exec(modified.slice(lt2))
    if (!tagNameMatch) return modified
    const tagName = tagNameMatch[1]!

    // Walk forward to find matching closing tag, tracking nested same-name opens.
    let depth = 1
    let i = gt2 + 1
    let closeStart = -1
    while (i < modified.length) {
      // Look for '<' that begins either a same-name open or close.
      const ch = modified[i]!
      if (ch === '<') {
        // Close?
        if (modified.startsWith(`</${tagName}`, i)) {
          depth--
          if (depth === 0) { closeStart = i; break }
          // skip past this close
          const closeEnd = modified.indexOf('>', i)
          if (closeEnd < 0) return modified
          i = closeEnd + 1
          continue
        }
        // Same-name open?
        if (modified.startsWith(`<${tagName}`, i) && /[\s/>]/.test(modified[i + 1 + tagName.length] ?? '>')) {
          depth++
        }
      }
      i++
    }
    if (closeStart < 0) return modified

    const inner = modified.slice(gt2 + 1, closeStart)

    // Safe-replace check: inner is only text + whitespace (no '<' or '{').
    if (/[<{]/.test(inner)) {
      // Has JSX expression or nested tags. Skip text patch — Sprint 2c.
      return modified
    }

    const newInner = patch.text
    modified = modified.slice(0, gt2 + 1) + newInner + modified.slice(closeStart)
  }

  return modified
}

/** Same brace/quote-aware tag-end scanner as derive-element-ids. */
function findTagOpenEnd(src: string, from: number): number {
  let i = from
  let braceDepth = 0
  let quote: '"' | "'" | '`' | null = null
  while (i < src.length) {
    const c = src[i]!
    if (quote) {
      if (c === '\\') { i += 2; continue }
      if (c === quote) quote = null
      i++
      continue
    }
    if (c === '"' || c === "'" || c === '`') { quote = c; i++; continue }
    if (c === '{') { braceDepth++; i++; continue }
    if (c === '}') { braceDepth = Math.max(0, braceDepth - 1); i++; continue }
    if (braceDepth === 0 && c === '>') return i
    i++
  }
  return -1
}
