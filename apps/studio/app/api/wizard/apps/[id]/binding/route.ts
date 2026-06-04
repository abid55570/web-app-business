/**
 * Studio v2 Sprint 5a — section-prop binding edits.
 *
 * GET  /api/wizard/apps/<id>/binding?elementId=<X:eN>
 *   → returns { sectionId, prop, currentValue, sourceFile } when the
 *     element clicked in the iframe maps to a section prop bound by
 *     the wirer (e.g. <h1>{title}</h1> → title prop).
 *
 * POST /api/wizard/apps/<id>/binding
 *   body: { elementId, value }
 *   → patches the value of that prop in the file that calls the
 *     section (page.tsx, signup/page.tsx, etc.) so the JSX expression
 *     resolves to the new value on next render. Triggers regen unless
 *     { regen: false }.
 *
 * For Sprint 5a we search every src/app/*.tsx for the section call site
 * and patch the FIRST occurrence's matching prop literal. Multi-occurrence
 * (e.g. CtaCentered used twice on one page) is Sprint 6 territory.
 */
import { NextResponse } from 'next/server'
import { spawn } from 'node:child_process'
import { readFile, readdir, stat, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const PROJECT_ROOT = resolve(process.cwd(), '..', '..')
const OUTPUT_DIR = resolve(PROJECT_ROOT, 'output')

type Params = { params: Promise<{ id: string }> }
function safeId(id: string): string | null { return /^wizard-[a-z0-9-]+$/i.test(id) ? id : null }

type Binding = { sectionId: string; prop: string }

async function readBindings(outDir: string): Promise<Record<string, Binding>> {
  try {
    const raw = await readFile(resolve(outDir, '.b-dash-element-bindings.json'), 'utf-8')
    return JSON.parse(raw) as Record<string, Binding>
  } catch {
    return {}
  }
}

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
          // Match `<SectionId` (with word boundary so we don't hit prefixes).
          const re = new RegExp(`<${sectionId}[\\s/>]`)
          if (re.test(src)) return abs
        } catch {
          // skip
        }
      }
    }
    return null
  }
  return await walk(appDir)
}

/** Parse the prop value as it appears in the section JSX call. Returns
 *  the string value if it's a literal (string/number/boolean) or null
 *  if it's a complex expression we don't dare modify here. */
function readPropFromCall(src: string, sectionId: string, prop: string): { value: string; literalType: 'string' | 'number' | 'boolean' | 'expression' } | null {
  // Find the first `<SectionId ...>` open tag's spread props OR direct prop.
  // derive-page emits: `<SectionId {...({prop: "val", ...} as ...)} />`
  // so look INSIDE the object literal for `prop: ...`
  const openRe = new RegExp(`<${sectionId}\\b`)
  const openIdx = src.search(openRe)
  if (openIdx < 0) return null
  // Find the matching `/>` for this opening tag (depth-aware, brace/quote-aware).
  let i = openIdx + sectionId.length + 1
  let braceDepth = 0
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
    if (c === '{') { braceDepth++; i++; continue }
    if (c === '}') { braceDepth--; i++; continue }
    if (braceDepth === 0 && c === '>') { end = i; break }
    i++
  }
  if (end < 0) return null
  const region = src.slice(openIdx, end + 1)

  // Find `prop:` inside the object literal. Allow quoted or bare key.
  const keyRe = new RegExp(`(?:^|[\\s,{])(?:"${prop}"|'${prop}'|${prop})\\s*:`, 'm')
  const km = keyRe.exec(region)
  if (!km) return null
  let j = km.index + km[0].length
  // Skip whitespace
  while (j < region.length && /\s/.test(region[j]!)) j++
  // Read the value: if " or ' or `, capture string; else read until next , or }
  const startCh = region[j]
  if (startCh === '"' || startCh === "'" || startCh === '`') {
    let v = ''
    let k = j + 1
    while (k < region.length) {
      const c = region[k]!
      if (c === '\\') { v += region[k + 1] ?? ''; k += 2; continue }
      if (c === startCh) return { value: v, literalType: 'string' }
      v += c
      k++
    }
    return null
  }
  // Non-string value — capture until , or } at depth 0
  let depth = 0
  let k = j
  while (k < region.length) {
    const c = region[k]!
    if (c === '(' || c === '{' || c === '[') depth++
    else if (c === ')' || c === '}' || c === ']') { if (depth === 0) break; depth-- }
    else if (depth === 0 && c === ',') break
    k++
  }
  const raw = region.slice(j, k).trim()
  if (/^-?\d+(\.\d+)?$/.test(raw)) return { value: raw, literalType: 'number' }
  if (raw === 'true' || raw === 'false') return { value: raw, literalType: 'boolean' }
  return { value: raw, literalType: 'expression' }
}

/** Replace the prop's value in the source file. Returns new source. */
function writePropToCall(src: string, sectionId: string, prop: string, newValue: string): string | null {
  const openRe = new RegExp(`<${sectionId}\\b`)
  const openIdx = src.search(openRe)
  if (openIdx < 0) return null
  // Find region end (matching `>` at depth 0)
  let i = openIdx + sectionId.length + 1
  let braceDepth = 0
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
    if (c === '{') { braceDepth++; i++; continue }
    if (c === '}') { braceDepth--; i++; continue }
    if (braceDepth === 0 && c === '>') { end = i; break }
    i++
  }
  if (end < 0) return null
  const region = src.slice(openIdx, end + 1)
  const keyRe = new RegExp(`((?:^|[\\s,{])(?:"${prop}"|'${prop}'|${prop})\\s*:)`, 'm')
  const km = keyRe.exec(region)
  if (!km) return null
  const keyEnd = km.index + km[0].length
  // Skip whitespace
  let j = keyEnd
  while (j < region.length && /\s/.test(region[j]!)) j++
  const startCh = region[j]
  // Compute end of current value
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
    // bareword expression — bail (don't overwrite an expression with a string blindly)
    return null
  }
  const before = region.slice(0, j)
  const after = region.slice(valEnd)
  const newRegion = before + JSON.stringify(newValue) + after
  return src.slice(0, openIdx) + newRegion + src.slice(end + 1)
}

export async function GET(req: Request, ctx: Params) {
  const { id: rawId } = await ctx.params
  const id = safeId(rawId)
  if (!id) return NextResponse.json({ error: 'invalid id' }, { status: 400 })
  const elementId = new URL(req.url).searchParams.get('elementId')
  if (!elementId) return NextResponse.json({ error: 'elementId required' }, { status: 400 })

  const outDir = resolve(OUTPUT_DIR, id)
  const bindings = await readBindings(outDir)
  const binding = bindings[elementId]
  if (!binding) {
    return NextResponse.json({ found: false })
  }
  const callSite = await findSectionCallSite(outDir, binding.sectionId)
  if (!callSite) {
    return NextResponse.json({ found: true, sectionId: binding.sectionId, prop: binding.prop, currentValue: null, sourceFile: null })
  }
  const src = await readFile(callSite, 'utf-8')
  const parsed = readPropFromCall(src, binding.sectionId, binding.prop)
  return NextResponse.json({
    found: true,
    sectionId: binding.sectionId,
    prop: binding.prop,
    currentValue: parsed?.value ?? null,
    literalType: parsed?.literalType ?? 'unknown',
    sourceFile: callSite.replace(outDir, '').replace(/\\/g, '/').replace(/^\//, ''),
  })
}

export async function POST(req: Request, ctx: Params) {
  const { id: rawId } = await ctx.params
  const id = safeId(rawId)
  if (!id) return NextResponse.json({ error: 'invalid id' }, { status: 400 })

  const body = (await req.json()) as { elementId?: string; value?: string; regen?: boolean }
  if (!body.elementId || typeof body.value !== 'string') {
    return NextResponse.json({ error: 'elementId + value required' }, { status: 400 })
  }

  const outDir = resolve(OUTPUT_DIR, id)
  const bindings = await readBindings(outDir)
  const binding = bindings[body.elementId]
  if (!binding) return NextResponse.json({ error: 'no binding for this element' }, { status: 404 })
  const callSite = await findSectionCallSite(outDir, binding.sectionId)
  if (!callSite) return NextResponse.json({ error: 'section call site not found' }, { status: 404 })
  const src = await readFile(callSite, 'utf-8')
  const next = writePropToCall(src, binding.sectionId, binding.prop, body.value)
  if (!next) return NextResponse.json({ error: 'cannot patch prop (expression or unparseable)' }, { status: 422 })

  // Write to overrides/<rel> rather than the baked file so future regens
  // preserve the edit via the wirer's overlay step.
  const rel = callSite.replace(outDir, '').replace(/\\/g, '/').replace(/^\//, '')
  const overridePath = resolve(outDir, 'overrides', rel)
  const { mkdir } = await import('node:fs/promises')
  await mkdir(resolve(overridePath, '..'), { recursive: true })
  await writeFile(overridePath, next, 'utf-8')

  if (body.regen === false) {
    return NextResponse.json({ ok: true, sourceFile: rel, regenSkipped: true })
  }
  const recipePath = resolve(outDir, 'recipe.json')
  const cli = resolve(PROJECT_ROOT, 'packages', 'cli', 'dist', 'index.js')
  const lines: string[] = []
  const exitCode = await new Promise<number>((res) => {
    const child = spawn('node', [cli, 'generate', recipePath, '--out', outDir], {
      cwd: PROJECT_ROOT, stdio: ['ignore', 'pipe', 'pipe'],
    })
    child.stdout.on('data', (d) => lines.push(String(d).trim()))
    child.stderr.on('data', (d) => lines.push('ERR: ' + String(d).trim()))
    child.on('close', (code) => res(code ?? 1))
  })
  return NextResponse.json({ ok: exitCode === 0, sourceFile: rel, log: lines.slice(-6) })
}
