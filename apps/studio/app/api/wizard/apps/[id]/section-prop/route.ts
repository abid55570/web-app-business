/**
 * Sprint 14 — POST /api/wizard/apps/<id>/section-prop
 *
 * Patches a SECTION-level prop value in the page.tsx that calls it.
 * Distinct from /binding (element-level JSX expression edits) — this
 * lets Studio change a section's wrapper-level prop like layoutVariant
 * without needing the prop to be bound to a specific data-bd-element.
 *
 * Body: { sectionId, prop, value, regen? }
 * Finds `<sectionId` in any frontend/src/app/**\/page.tsx, locates the
 * object-literal arg passed via spread, swaps the prop's value (string,
 * number, or boolean literal). Saves via the same overrides + regen
 * pipeline as /file does.
 *
 * On success, returns { ok, sourceFile, value }.
 */
import { NextResponse } from 'next/server'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { deriveApplyOverrides } from '@b-dash/wirer'

const PROJECT_ROOT = resolve(process.cwd(), '..', '..')
const OUTPUT_DIR = resolve(PROJECT_ROOT, 'output')

type Params = { params: Promise<{ id: string }> }
function safeId(id: string): string | null { return /^wizard-[a-z0-9-]+$/i.test(id) ? id : null }

/** Walk frontend/src/app/ for files containing the section's call site. */
async function findSectionCallSite(outDir: string, sectionId: string): Promise<string | null> {
  const appDir = resolve(outDir, 'frontend', 'src', 'app')
  async function walk(d: string): Promise<string | null> {
    let entries
    try { entries = await readdir(d, { withFileTypes: true }) } catch { return null }
    for (const e of entries) {
      const abs = resolve(d, e.name)
      if (e.isDirectory()) {
        const hit = await walk(abs)
        if (hit) return hit
      } else if (e.isFile() && e.name.endsWith('.tsx')) {
        try {
          const src = await readFile(abs, 'utf-8')
          if (new RegExp(`<${sectionId}[\\s/>]`).test(src)) return abs
        } catch { /* skip */ }
      }
    }
    return null
  }
  return await walk(appDir)
}

/** Swap (or insert) a prop value in the section's call site object literal.
 *  Supports string, number, boolean literal values. */
function writeProp(src: string, sectionId: string, prop: string, value: string | number | boolean): string | null {
  const openRe = new RegExp(`<${sectionId}\\b`)
  const openIdx = src.search(openRe)
  if (openIdx < 0) return null
  // Find the matching `>` for this opening tag (depth-aware).
  let i = openIdx + sectionId.length + 1
  let depth = 0
  let quote: '"' | "'" | '`' | null = null
  let end = -1
  while (i < src.length) {
    const c = src[i]!
    if (quote) {
      if (c === '\\') { i += 2; continue }
      if (c === quote) quote = null
      i++; continue
    }
    if (c === '"' || c === "'" || c === '`') { quote = c; i++; continue }
    if (c === '{') { depth++; i++; continue }
    if (c === '}') { depth--; i++; continue }
    if (depth === 0 && c === '>') { end = i; break }
    i++
  }
  if (end < 0) return null
  const region = src.slice(openIdx, end + 1)

  const valueLiteral =
    typeof value === 'string'  ? JSON.stringify(value)  :
    typeof value === 'number'  ? String(value)           :
    typeof value === 'boolean' ? String(value)           :
                                  JSON.stringify(String(value))

  // Find existing `prop:` inside the object literal — swap its value.
  const keyRe = new RegExp(`((?:^|[\\s,{])(?:"${prop}"|'${prop}'|${prop})\\s*:)`, 'm')
  const km = keyRe.exec(region)
  if (km) {
    const keyEnd = km.index + km[0].length
    // Find end of current value (next , or } at depth 0).
    let j = keyEnd
    while (j < region.length && /\s/.test(region[j]!)) j++
    const startCh = region[j]
    let valEnd = j
    if (startCh === '"' || startCh === "'" || startCh === '`') {
      valEnd = j + 1
      while (valEnd < region.length) {
        const c = region[valEnd]!
        if (c === '\\') { valEnd += 2; continue }
        if (c === startCh) { valEnd++; break }
        valEnd++
      }
    } else {
      let d = 0
      while (valEnd < region.length) {
        const c = region[valEnd]!
        if (c === '(' || c === '{' || c === '[') d++
        else if (c === ')' || c === '}' || c === ']') { if (d === 0) break; d-- }
        else if (d === 0 && c === ',') break
        valEnd++
      }
    }
    const newRegion = region.slice(0, j) + valueLiteral + region.slice(valEnd)
    return src.slice(0, openIdx) + newRegion + src.slice(end + 1)
  }

  // Prop doesn't exist — insert before the closing `}` of the object literal.
  const closeBrace = region.lastIndexOf('}')
  if (closeBrace < 0) return null
  // Walk back over whitespace
  let insertAt = closeBrace
  while (insertAt > 0 && /\s/.test(region[insertAt - 1]!)) insertAt--
  // Add a trailing comma to the preceding item if missing
  const before = region[insertAt - 1]
  const sep = before === ',' || before === '{' ? '\n    ' : ',\n    '
  const newRegion = region.slice(0, insertAt) + `${sep}${prop}: ${valueLiteral}` + region.slice(insertAt)
  return src.slice(0, openIdx) + newRegion + src.slice(end + 1)
}

export async function POST(req: Request, ctx: Params) {
  const { id: rawId } = await ctx.params
  const id = safeId(rawId)
  if (!id) return NextResponse.json({ error: 'invalid id' }, { status: 400 })

  const body = (await req.json()) as { sectionId?: string; prop?: string; value?: string | number | boolean }
  if (!body.sectionId || !body.prop || body.value === undefined) {
    return NextResponse.json({ error: 'sectionId + prop + value required' }, { status: 400 })
  }

  const outDir = resolve(OUTPUT_DIR, id)
  const callSite = await findSectionCallSite(outDir, body.sectionId)
  if (!callSite) return NextResponse.json({ error: `<${body.sectionId} not found in any page.tsx` }, { status: 404 })

  const src = await readFile(callSite, 'utf-8')
  const next = writeProp(src, body.sectionId, body.prop, body.value)
  if (!next) return NextResponse.json({ error: 'could not patch prop (unparseable)' }, { status: 422 })

  // Write to overrides/<rel> so the change survives regen via overlay-overrides.
  const rel = callSite.replace(outDir, '').replace(/\\/g, '/').replace(/^\//, '')
  const overridePath = resolve(outDir, 'overrides', rel)
  await mkdir(resolve(overridePath, '..'), { recursive: true })
  await writeFile(overridePath, next, 'utf-8')
  // Also write directly to the live file so Next dev HMR picks it up immediately
  await writeFile(callSite, next, 'utf-8')

  // Reapply element-level overrides too (in case any exist for this file).
  await deriveApplyOverrides({ outputDir: outDir }).catch(() => {})

  return NextResponse.json({
    ok: true,
    sourceFile: rel,
    value: body.value,
  })
}
