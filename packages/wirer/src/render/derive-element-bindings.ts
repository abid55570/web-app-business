/**
 * Build a `data-bd-element → section-prop` binding map for every
 * tagged JSX node whose children are a single JSX expression
 * resolving to a destructured prop.
 *
 * Used by Studio v2 Sprint 5a so the user can click "Create your
 * account" (which is `{title}` in the source, not literal text) and
 * edit the actual section prop instead of the JSX expression literally.
 *
 * Output: `<out>/.b-dash-element-bindings.json`
 *   {
 *     "Hero3DScene:e3": { sectionId: "Hero3DScene", prop: "headline" },
 *     "Hero3DScene:e4": { sectionId: "Hero3DScene", prop: "body" },
 *     ...
 *   }
 *
 * Approach (regex-based, fast + good enough for current catalog):
 *   1. For each section file, find the function signature & extract
 *      destructured prop names: `{ a, b, c = 'def', ...rest }`.
 *   2. Walk each `data-bd-element="<id>:e<n>"` attribute occurrence.
 *   3. Read the children between opening tag's `>` and matching close.
 *   4. If children look like `{propName}` (after trim), record the
 *      binding for that propName. Skip composite expressions.
 *
 * Runs AFTER derive-element-ids so the tags are stable.
 */
import { readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

export type DeriveElementBindingsArgs = {
  outputDir: string
}

export type Binding = { sectionId: string; prop: string }
export type BindingsMap = Record<string, Binding>

export async function deriveElementBindings(args: DeriveElementBindingsArgs): Promise<{ bindings: number }> {
  const sectionsRoot = path.join(args.outputDir, 'frontend', 'src', 'sections')
  let dirs: string[]
  try {
    dirs = (await readdir(sectionsRoot, { withFileTypes: true }))
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
  } catch {
    return { bindings: 0 }
  }

  const out: BindingsMap = {}
  for (const sectionId of dirs) {
    const dir = path.join(sectionsRoot, sectionId)
    let files
    try {
      files = await readdir(dir)
    } catch {
      continue
    }
    for (const f of files) {
      if (!f.endsWith('.tsx')) continue
      const src = await readFile(path.join(dir, f), 'utf-8')
      const localBindings = extractBindings(src, sectionId)
      Object.assign(out, localBindings)
    }
  }

  await writeFile(
    path.join(args.outputDir, '.b-dash-element-bindings.json'),
    JSON.stringify(out, null, 2),
    'utf-8',
  )
  return { bindings: Object.keys(out).length }
}

/** Scan one section's source for element→prop bindings. */
function extractBindings(src: string, sectionId: string): BindingsMap {
  const result: BindingsMap = {}
  // The wirer marks every element. Look at each.
  const re = /data-bd-element="([^"]+)"/g
  let m: RegExpExecArray | null
  while ((m = re.exec(src)) !== null) {
    const elementId = m[1]!
    if (!elementId.startsWith(sectionId + ':')) continue
    // Find the position of the opening tag end (`>`) for this attribute.
    const attrIdx = m.index
    let lt = attrIdx
    while (lt > 0 && src[lt] !== '<') lt--
    const gt = findTagOpenEnd(src, lt + 1)
    if (gt < 0) continue
    const isSelfClose = src[gt - 1] === '/'
    if (isSelfClose) continue // void element — no children

    // Children area starts at gt+1. Walk forward up to first `<` that's
    // either the close of this tag or a nested open. We only care about
    // the case where children are EXACTLY a single JSX expression
    // `{propName}` (allowing leading/trailing whitespace).
    let i = gt + 1
    // Skip whitespace
    while (i < src.length && /\s/.test(src[i]!)) i++
    if (src[i] !== '{') continue
    // Walk the {expr} respecting nested braces & strings.
    const exprStart = i + 1
    let depth = 1
    let j = exprStart
    let quote: '"' | "'" | '`' | null = null
    while (j < src.length && depth > 0) {
      const c = src[j]!
      if (quote) {
        if (c === '\\') { j += 2; continue }
        if (c === quote) quote = null
        j++; continue
      }
      if (c === '"' || c === "'" || c === '`') { quote = c; j++; continue }
      if (c === '{') depth++
      else if (c === '}') { depth--; if (depth === 0) break }
      j++
    }
    if (depth !== 0) continue
    const expr = src.slice(exprStart, j).trim()
    // After the expression, optional whitespace then must be a closing tag start `<`.
    let k = j + 1
    while (k < src.length && /\s/.test(src[k]!)) k++
    if (src[k] !== '<') continue
    // Accept only bare identifier expressions: `propName` (no dots/calls).
    // This is the safe set we can patch back into page.tsx props.
    if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(expr)) continue
    result[elementId] = { sectionId, prop: expr }
  }
  return result
}

function findTagOpenEnd(src: string, from: number): number {
  let i = from
  let braceDepth = 0
  let quote: '"' | "'" | '`' | null = null
  while (i < src.length) {
    const c = src[i]!
    if (quote) {
      if (c === '\\') { i += 2; continue }
      if (c === quote) quote = null
      i++; continue
    }
    if (c === '"' || c === "'" || c === '`') { quote = c; i++; continue }
    if (c === '{') { braceDepth++; i++; continue }
    if (c === '}') { braceDepth = Math.max(0, braceDepth - 1); i++; continue }
    if (braceDepth === 0 && c === '>') return i
    i++
  }
  return -1
}
