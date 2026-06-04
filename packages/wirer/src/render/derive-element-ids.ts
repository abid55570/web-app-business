/**
 * Inject `data-bd-element="<scope>:e<n>"` attributes on every interesting
 * HTML JSX opening tag inside both section files AND page files.
 *
 * Foundation for Sprint 2 (now extended in Sprint 6) — gives Studio's
 * iframe-bridge a stable selector for every button/text/image/container so
 * click-to-select + inline editing can target one specific element on ANY
 * page, not just on the Home page's composed sections.
 *
 * Scope:
 *   - `<out>/frontend/src/sections/<sectionId>/*.tsx` → `<sectionId>:e<n>`
 *   - `<out>/frontend/src/app/**\/page.tsx`           → `page-<pageId>:e<n>`
 *
 * `<pageId>` is the slug derived from the page's directory under app/.
 *   - `app/page.tsx`              → `home`
 *   - `app/signup/page.tsx`       → `signup`
 *   - `app/dashboard/page.tsx`    → `dashboard`
 *   - `app/blog/[slug]/page.tsx`  → `blog-slug`
 *
 * Source section files in the catalog stay untouched — only the COPY in
 * the output dir gets the attrs injected.
 *
 * Approach: line-walk + regex on opening tags. Skips React component tags
 * (PascalCase) and any tag that already carries data-bd-element. Multi-
 * line tags handled by tracking open-tag-without-close across lines.
 * Comments + strings sniffed lightly to avoid false matches.
 *
 * Not a full JSX parser — accepts ~95% coverage on the catalog's tag
 * shapes. We can switch to @babel/parser later if pathological cases bite.
 */
import { readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

export type DeriveElementIdsArgs = {
  outputDir: string
}

// HTML tags we want addressable. Restricted set keeps noise down
// (we don't tag every <br/> or every nested <li>).
const TAGGABLE = new Set([
  'a', 'button', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'span', 'img', 'picture', 'video',
  'section', 'div', 'main', 'article', 'aside',
  'header', 'footer', 'nav',
  'ul', 'ol', 'li',
  'form', 'input', 'textarea', 'label', 'select',
  'figure', 'figcaption', 'blockquote', 'pre', 'code',
])

const OPEN_TAG_RE = /<([a-z][a-z0-9]*)(\s|>|\/>)/g

export async function deriveElementIds(args: DeriveElementIdsArgs): Promise<{ files: number; tags: number }> {
  let filesPatched = 0
  let tagsPatched = 0

  // ── 1. Walk sections — keep existing `<sectionId>:e<n>` namespace ──
  const sectionsRoot = path.join(args.outputDir, 'frontend', 'src', 'sections')
  let categories: import('node:fs').Dirent[] = []
  try {
    categories = await readdir(sectionsRoot, { withFileTypes: true })
  } catch {
    // no sections dir — fine, just skip
  }
  for (const cat of categories.filter((e) => e.isDirectory())) {
    const dir = path.join(sectionsRoot, cat.name)
    let entries: import('node:fs').Dirent[] = []
    try {
      entries = await readdir(dir, { withFileTypes: true })
    } catch {
      continue
    }
    for (const f of entries) {
      if (!f.isFile() || !f.name.endsWith('.tsx')) continue
      const filePath = path.join(dir, f.name)
      const sectionId = cat.name // dir name IS the section ID per copy-sections layout
      const before = await readFile(filePath, 'utf-8')
      const { content, count } = injectIntoFile(before, sectionId)
      if (count > 0) {
        await writeFile(filePath, content, 'utf-8')
        filesPatched++
        tagsPatched += count
      }
    }
  }

  // ── 2. Walk app/ pages — `page-<pageId>:e<n>` namespace ──
  // So Studio's bridge can click-to-select elements on /signup, /login,
  // /dashboard, /pricing etc. — not just the home page's composed sections.
  const appRoot = path.join(args.outputDir, 'frontend', 'src', 'app')
  const pageFiles = await findPageTsxFiles(appRoot)
  for (const pageFile of pageFiles) {
    const pageId = pageIdFromPath(pageFile, appRoot)
    const before = await readFile(pageFile, 'utf-8')
    const { content, count } = injectIntoFile(before, `page-${pageId}`)
    if (count > 0) {
      await writeFile(pageFile, content, 'utf-8')
      filesPatched++
      tagsPatched += count
    }
  }

  return { files: filesPatched, tags: tagsPatched }
}

/** Recursively find every `page.tsx` under `appRoot`. */
async function findPageTsxFiles(appRoot: string): Promise<string[]> {
  const out: string[] = []
  async function walk(dir: string): Promise<void> {
    let entries: import('node:fs').Dirent[] = []
    try {
      entries = await readdir(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const e of entries) {
      if (e.name.startsWith('.')) continue
      const abs = path.join(dir, e.name)
      if (e.isDirectory()) {
        await walk(abs)
      } else if (e.isFile() && e.name === 'page.tsx') {
        out.push(abs)
      }
    }
  }
  await walk(appRoot)
  return out
}

/** Derive a page slug from its path under app/.
 *   app/page.tsx              → 'home'
 *   app/signup/page.tsx       → 'signup'
 *   app/blog/[slug]/page.tsx  → 'blog-slug'   (brackets stripped)
 *   app/(group)/x/page.tsx    → 'x'           (route groups stripped)
 */
function pageIdFromPath(pageFile: string, appRoot: string): string {
  const rel = path.relative(appRoot, pageFile).replace(/\\/g, '/')
  // Drop trailing "/page.tsx"
  const dir = rel.replace(/\/page\.tsx$/i, '').replace(/^page\.tsx$/i, '')
  if (!dir) return 'home'
  // Strip route groups "(...)" and bracket the path segments.
  const segs = dir.split('/')
    .filter((s) => !/^\(.*\)$/.test(s)) // remove route groups like (marketing)
    .map((s) => s.replace(/^\[\.\.\.(.+)\]$/, '$1').replace(/^\[(.+)\]$/, '$1'))
    .filter(Boolean)
  return segs.length === 0 ? 'home' : segs.join('-')
}

/**
 * Inject `data-bd-element="<sectionId>:e<n>"` into every opening
 * HTML tag in TAGGABLE that doesn't already carry one.
 *
 * Heuristics:
 *   - PascalCase opens are React components → skip (no first-char-lowercase).
 *   - Tags that already contain `data-bd-element` → skip (idempotent).
 *   - Self-closing form `<img ... />` and pair-open form `<div ...>`
 *     both handled — we inject right before the trailing `/>` or `>`.
 *   - Multi-line open tags: we slice until the first unbalanced `>`
 *     OUTSIDE braces/strings (lightweight scan).
 */
function injectIntoFile(src: string, sectionId: string): { content: string; count: number } {
  // Skip files that obviously already have markers (idempotent regen).
  if (src.includes('data-bd-element=')) {
    return { content: src, count: 0 }
  }

  let counter = 0
  let out = ''
  let i = 0
  while (i < src.length) {
    const m = nextOpenTag(src, i)
    if (!m) {
      out += src.slice(i)
      break
    }
    // Emit everything before this match.
    out += src.slice(i, m.start)
    const tagName = m.tagName
    const isTaggable = TAGGABLE.has(tagName)
    // Find the end of the opening tag (`>` or `/>`) respecting braces/quotes.
    const endIdx = findTagOpenEnd(src, m.start + 1 + tagName.length)
    if (endIdx === -1) {
      // Malformed — bail by emitting rest as-is.
      out += src.slice(m.start)
      break
    }
    const openTagFull = src.slice(m.start, endIdx + 1)
    if (!isTaggable || openTagFull.includes('data-bd-element=')) {
      out += openTagFull
    } else {
      const isSelfClose = openTagFull.endsWith('/>')
      const inner = openTagFull.slice(0, isSelfClose ? -2 : -1)
      const id = `${sectionId}:e${counter++}`
      out += `${inner} data-bd-element="${id}"${isSelfClose ? '/>' : '>'}`
    }
    i = endIdx + 1
  }
  return { content: out, count: counter }
}

/** Locate the next `<lowercaseTag` opener at or after `from`. */
function nextOpenTag(src: string, from: number): { start: number; tagName: string } | null {
  OPEN_TAG_RE.lastIndex = from
  const m = OPEN_TAG_RE.exec(src)
  if (!m) return null
  // m.index points at `<`; m[1] is tag name.
  return { start: m.index, tagName: m[1] }
}

/** Find the `>` that closes the opening tag starting near `from`.
 *  Tracks `{...}` brace depth and quoted strings so a `>` inside
 *  `onClick={() => doSomething('a>b')}` doesn't trip us. */
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
