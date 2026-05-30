/**
 * `b-dash studio <project-dir>` — Phase 4 stub.
 *
 * Serves a static HTML viewer at http://localhost:3001 that surfaces:
 *   - Block manifests discovered under <project>/studio/blocks/
 *   - Current studio-state.json (if any)
 *   - Theme tokens in use
 *
 * Real Puck-driven editor + drag/drop + Properties panel land in Phase 4
 * proper. This stub exists so the CLI surface + studio-state.json
 * read/write path are wired end-to-end and the operator can sanity-check
 * what the wirer + Studio see.
 */
import { createServer } from 'node:http'
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import kleur from 'kleur'
import { StudioStateSchema, type StudioState } from '@b-dash/schemas'


type Args = {
  projectDir: string | null
  port: number
}


function parseArgs(args: string[]): Args {
  let projectDir: string | null = null
  let port = 3001
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--port') {
      port = Number.parseInt(args[++i] ?? '3001', 10)
    } else if (a && !a.startsWith('-') && projectDir === null) {
      projectDir = a
    }
  }
  return { projectDir, port }
}


export async function runStudio(args: string[]): Promise<number> {
  const parsed = parseArgs(args)
  if (!parsed.projectDir) {
    process.stderr.write(
      kleur.red('Usage: b-dash studio <project-dir> [--port <n>]\n'),
    )
    return 2
  }
  const projectRoot = path.resolve(parsed.projectDir)
  if (!(await dirExists(projectRoot))) {
    process.stderr.write(
      kleur.red(`Project dir not found: ${projectRoot}\n`),
    )
    return 1
  }

  // Boot defaults — read or seed studio-state.json.
  const statePath = path.join(projectRoot, 'studio-state.json')
  const recipePath = path.join(projectRoot, 'recipe.json')
  const recipeId = await readRecipeId(recipePath)
  const state = await loadOrSeedState(statePath, recipeId)
  const blocks = await scanBlocks(projectRoot)

  const html = renderViewer({ recipeId, state, blocks, projectRoot })

  const server = createServer((req, res) => {
    if (req.method === 'GET' && (req.url === '/' || req.url?.startsWith('/?'))) {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
      res.end(html)
      return
    }
    if (req.method === 'GET' && req.url === '/api/state') {
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify(state, null, 2))
      return
    }
    if (req.method === 'GET' && req.url === '/api/blocks') {
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify(blocks, null, 2))
      return
    }
    res.writeHead(404)
    res.end('Not found')
  })

  await new Promise<void>((resolve) =>
    server.listen(parsed.port, () => resolve()),
  )

  process.stdout.write(
    kleur.bold(`\n🎨 b-dash studio\n`) +
      kleur.dim(`  project:  ${projectRoot}\n`) +
      kleur.dim(`  recipe:   ${recipeId ?? '(none)'}\n`) +
      kleur.dim(`  blocks:   ${blocks.length} discovered\n`) +
      kleur.cyan(`  open:     http://localhost:${parsed.port}\n\n`) +
      kleur.dim('  Phase 4 stub — read-only viewer. Editor lands in Phase 4 proper.\n') +
      kleur.dim('  Ctrl+C to stop.\n'),
  )

  // Block until SIGINT.
  await new Promise<void>((resolve) => {
    process.on('SIGINT', () => {
      server.close(() => resolve())
    })
  })
  return 0
}


async function readRecipeId(p: string): Promise<string | null> {
  try {
    const raw = await readFile(p, 'utf-8')
    const parsed = JSON.parse(raw) as { id?: string }
    return parsed.id ?? null
  } catch {
    return null
  }
}


async function loadOrSeedState(
  statePath: string,
  recipeId: string | null,
): Promise<StudioState> {
  try {
    const raw = await readFile(statePath, 'utf-8')
    return StudioStateSchema.parse(JSON.parse(raw))
  } catch {
    const seeded: StudioState = {
      schemaVersion: '1.0.0',
      recipeId: recipeId ?? 'unknown',
      updatedAt: new Date().toISOString(),
      pages: {},
    }
    await writeFile(statePath, JSON.stringify(seeded, null, 2) + '\n', 'utf-8')
    return seeded
  }
}


type DiscoveredBlock = {
  id: string
  sourceModule: string
  manifestPath: string
}


async function scanBlocks(projectRoot: string): Promise<DiscoveredBlock[]> {
  // Phase 4 stub: walks two trees for *.studio.json manifests:
  //   - <out>/frontend/src/components/<module>/  (per-module blocks)
  //   - <out>/frontend/src/sections/<sectionId>/ (catalog sections)
  // Real scan + zod-parse lands in Phase 4 proper.
  const out: DiscoveredBlock[] = []
  const roots: { dir: string; sourceLabel: string }[] = [
    {
      dir: path.join(projectRoot, 'frontend', 'src', 'components'),
      sourceLabel: 'module',
    },
    {
      dir: path.join(projectRoot, 'frontend', 'src', 'sections'),
      sourceLabel: 'section',
    },
  ]
  for (const { dir: rootDir, sourceLabel } of roots) {
    if (!(await dirExists(rootDir))) continue
    for (const childDir of await readdir(rootDir, { withFileTypes: true })) {
      if (!childDir.isDirectory()) continue
      const dir = path.join(rootDir, childDir.name)
      for (const entry of await readdir(dir, { withFileTypes: true })) {
        if (!entry.isFile() || !entry.name.endsWith('.studio.json')) continue
        const id = entry.name.replace(/\.studio\.json$/, '')
        out.push({
          id,
          sourceModule: `${sourceLabel}:${childDir.name}`,
          manifestPath: path.join(dir, entry.name),
        })
      }
    }
  }
  return out
}


function renderViewer(input: {
  recipeId: string | null
  state: StudioState
  blocks: DiscoveredBlock[]
  projectRoot: string
}): string {
  const blockRows = input.blocks
    .map(
      (b) =>
        `<li><strong>${escape(b.id)}</strong> <span class="muted">${escape(b.sourceModule)}</span></li>`,
    )
    .join('')
  const pagesRows = Object.values(input.state.pages)
    .map(
      (p) =>
        `<li><code>${escape(p.path)}</code> — ${p.blocks.length} blocks</li>`,
    )
    .join('')
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>b-dash studio — ${escape(input.recipeId ?? '')}</title>
<style>
  body { font: 14px/1.5 system-ui, sans-serif; margin: 0; padding: 24px; max-width: 880px; color: #111; }
  h1 { margin: 0 0 4px; font-size: 18px; }
  h2 { font-size: 14px; text-transform: uppercase; letter-spacing: .04em; color: #555; margin: 24px 0 8px; }
  .muted { color: #888; }
  ul { padding-left: 20px; margin: 0; }
  code { background: #f4f4f5; padding: 1px 4px; border-radius: 3px; }
  .empty { color: #888; font-style: italic; }
  pre { background: #f9f9f9; padding: 12px; border-radius: 6px; overflow: auto; max-height: 280px; }
</style>
</head>
<body>
  <h1>🎨 b-dash studio</h1>
  <div class="muted">Recipe: ${escape(input.recipeId ?? '(none)')} · ${escape(input.projectRoot)}</div>

  <h2>Discovered blocks</h2>
  ${input.blocks.length === 0
    ? '<p class="empty">No <code>*.studio.json</code> manifests found under frontend/src/components/.</p>'
    : `<ul>${blockRows}</ul>`}

  <h2>Pages in studio-state</h2>
  ${Object.keys(input.state.pages).length === 0
    ? '<p class="empty">No pages laid out yet — Studio writes start populating <code>studio-state.json</code> once you drag a block onto the canvas.</p>'
    : `<ul>${pagesRows}</ul>`}

  <h2>studio-state.json</h2>
  <pre>${escape(JSON.stringify(input.state, null, 2))}</pre>
</body>
</html>`
}


function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}


async function dirExists(p: string): Promise<boolean> {
  try {
    const s = await stat(p)
    return s.isDirectory()
  } catch {
    return false
  }
}


// satisfy unused-import linter; reserved for incremental writes in Phase 4 proper.
void mkdir
