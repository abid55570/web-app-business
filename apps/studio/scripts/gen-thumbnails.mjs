/**
 * Generate real PNG thumbnails for sections by screenshotting them
 * inside a running generated app.
 *
 * Usage:
 *   pnpm --filter @b-dash/studio-app thumbnails -- \
 *     --app wizard-1780553744793 \
 *     --port 3000 \
 *     [--force]
 *
 * The script:
 *   1. Connects via Playwright to http://localhost:<port>
 *   2. Walks every page in the generated app (/, /pricing, /about, ...)
 *   3. Finds every `[data-bd-element$=":e0"]` — the top-level node of
 *      each section
 *   4. Extracts <sectionId> from the prefix
 *   5. Crops a screenshot to that element's bounding box
 *   6. Writes apps/studio/public/thumbnails/<sectionId>.png
 *
 * Skips sections whose PNG already exists unless --force is passed.
 * Studio's /api/sections/thumbnail/<id> endpoint already prefers PNG
 * over SVG, so generated thumbnails light up instantly.
 *
 * NOTE: The app needs the Sprint 1 element-ID injection. Apps generated
 * BEFORE that commit won't have data-bd-element attrs — regenerate with
 * the current wirer first.
 */
import { chromium } from 'playwright'
import { mkdir, stat } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..', '..', '..')
const STUDIO_PUBLIC = resolve(__dirname, '..', 'public', 'thumbnails')

function parseArgs() {
  const args = process.argv.slice(2)
  const out = { app: '', port: 3000, force: false, pages: ['/'] }
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--app') out.app = args[++i] ?? ''
    else if (a === '--port') out.port = Number(args[++i] ?? 3000)
    else if (a === '--force') out.force = true
    else if (a === '--pages') out.pages = (args[++i] ?? '').split(',').map((p) => p.trim()).filter(Boolean)
  }
  return out
}

async function exists(path) {
  try { await stat(path); return true } catch { return false }
}

async function probeRecipePages(appId) {
  // Try to read the app's recipe.json to discover extra pages too.
  const { readFile } = await import('node:fs/promises')
  try {
    const raw = await readFile(resolve(PROJECT_ROOT, 'output', appId, 'recipe.json'), 'utf-8')
    const recipe = JSON.parse(raw)
    const pages = ['/']
    for (const p of recipe.extraPages ?? []) pages.push(`/${p}`)
    return pages
  } catch {
    return ['/']
  }
}

async function main() {
  const { app, port, force, pages: argPages } = parseArgs()
  if (!app) {
    console.error('Missing --app <wizard-id>. Example:')
    console.error('  pnpm thumbnails -- --app wizard-1780553744793 --port 3000')
    process.exit(2)
  }
  await mkdir(STUDIO_PUBLIC, { recursive: true })

  // If user didn't pass --pages, derive from recipe.extraPages.
  const pages = argPages.length === 1 && argPages[0] === '/' ? await probeRecipePages(app) : argPages
  console.log(`▶ Capturing sections from ${pages.length} page(s) on http://localhost:${port}`)
  console.log(`  output: ${STUDIO_PUBLIC}`)
  console.log(`  app:    ${app}`)
  console.log(`  pages:  ${pages.join(', ')}`)
  console.log(`  force:  ${force ? 'yes (overwrite existing)' : 'no (skip existing)'}`)

  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const page = await ctx.newPage()
  // Squelch console noise
  page.on('pageerror', () => {})
  page.on('console', () => {})

  const seen = new Set()
  let captured = 0
  let skipped = 0

  for (const route of pages) {
    const url = `http://localhost:${port}${route}`
    console.log(`\n→ ${url}`)
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 })
    } catch (e) {
      console.warn(`  ✗ load failed: ${e.message}`)
      continue
    }
    // Give framer-motion / r3f a beat to settle
    await page.waitForTimeout(1200)
    // Get every section's top-level element (`data-bd-element` ends ':e0').
    const handles = await page.$$('[data-bd-element$=":e0"]')
    console.log(`  found ${handles.length} section root(s)`)
    for (const h of handles) {
      const elId = await h.getAttribute('data-bd-element')
      const sectionId = elId?.split(':')[0]
      if (!sectionId || seen.has(sectionId)) continue
      seen.add(sectionId)
      const png = resolve(STUDIO_PUBLIC, `${sectionId}.png`)
      if (!force && await exists(png)) {
        skipped++
        continue
      }
      try {
        // Screenshot just this element. Playwright handles scroll +
        // clipping automatically when given an element handle.
        await h.scrollIntoViewIfNeeded({ timeout: 5000 })
        await page.waitForTimeout(250) // let scroll-driven animations catch up
        await h.screenshot({ path: png, type: 'png', timeout: 10_000 })
        captured++
        console.log(`  ✓ ${sectionId}`)
      } catch (e) {
        console.warn(`  ✗ ${sectionId}: ${e.message}`)
      }
    }
  }

  await browser.close()
  console.log(`\n──────────────`)
  console.log(`Captured: ${captured} new thumbnail(s)`)
  console.log(`Skipped:  ${skipped} (already cached — pass --force to redo)`)
  console.log(`Total in palette: ${captured + skipped} now backed by real PNGs`)
}

main().catch((e) => {
  console.error('Fatal:', e)
  process.exit(1)
})
