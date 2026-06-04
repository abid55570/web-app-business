/**
 * GET /api/wizard/apps/<id>/files
 *
 * Returns the file tree of a generated app — module-aware, grouped:
 *   {
 *     modules: [
 *       { id: 'auth-core', files: [{ path: 'backend/app/auth_core/router.py', name: 'router.py', size }, ...] },
 *       ...
 *     ],
 *     pages: [
 *       { path: 'frontend/src/app/page.tsx', name: 'page.tsx', size }
 *     ],
 *     sections: [
 *       { id: 'Hero3DScene', path: 'frontend/src/sections/Hero3DScene/Hero3DScene.tsx', size }
 *     ]
 *   }
 *
 * Only safe-listed dirs scanned (no node_modules, .venv, .next, etc.).
 */
import { NextResponse } from 'next/server'
import { readdir, stat } from 'node:fs/promises'
import { resolve } from 'node:path'

const PROJECT_ROOT = resolve(process.cwd(), '..', '..')
const OUTPUT_DIR = resolve(PROJECT_ROOT, 'output')

type Params = { params: Promise<{ id: string }> }
function safeId(id: string): string | null { return /^wizard-[a-z0-9-]+$/i.test(id) ? id : null }

type FileEntry = { path: string; name: string; size: number }

async function walkDir(absRoot: string, relRoot: string): Promise<FileEntry[]> {
  const out: FileEntry[] = []
  let entries
  try {
    entries = await readdir(absRoot, { withFileTypes: true })
  } catch {
    return out
  }
  for (const e of entries) {
    if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === '__pycache__' || e.name === '.venv') continue
    const abs = resolve(absRoot, e.name)
    const rel = relRoot ? `${relRoot}/${e.name}` : e.name
    if (e.isDirectory()) {
      out.push(...(await walkDir(abs, rel)))
    } else if (e.isFile()) {
      const st = await stat(abs)
      out.push({ path: rel, name: e.name, size: st.size })
    }
  }
  return out
}

export async function GET(_req: Request, ctx: Params) {
  const { id: rawId } = await ctx.params
  const id = safeId(rawId)
  if (!id) return NextResponse.json({ error: 'invalid id' }, { status: 400 })
  const outDir = resolve(OUTPUT_DIR, id)

  // Read the recipe to know which modules are installed.
  let modules: { id: string }[] = []
  try {
    const { readFile } = await import('node:fs/promises')
    const recipe = JSON.parse(await readFile(resolve(outDir, 'recipe.json'), 'utf-8'))
    modules = (recipe.modules ?? []).map((m: { id: string }) => ({ id: m.id }))
  } catch {
    // missing recipe — fine, return empty
  }

  // For each module, look under backend/app/<module-id-underscore>/
  const modulesOut: { id: string; files: FileEntry[] }[] = []
  for (const m of modules) {
    const pyPkg = m.id.replace(/-/g, '_')
    const moduleAbs = resolve(outDir, 'backend', 'app', pyPkg)
    const files = await walkDir(moduleAbs, `backend/app/${pyPkg}`)
    if (files.length > 0) {
      modulesOut.push({ id: m.id, files })
    }
  }

  // Frontend pages (under src/app)
  const pages = (await walkDir(resolve(outDir, 'frontend', 'src', 'app'), 'frontend/src/app'))
    .filter((f) => f.name === 'page.tsx' || f.name === 'layout.tsx')

  // Sections (under src/sections)
  const sectionsRoot = resolve(outDir, 'frontend', 'src', 'sections')
  let sectionDirs: string[] = []
  try {
    sectionDirs = (await readdir(sectionsRoot, { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => e.name)
  } catch {
    // no sections
  }
  const sections: { id: string; files: FileEntry[] }[] = []
  for (const sid of sectionDirs) {
    const files = await walkDir(resolve(sectionsRoot, sid), `frontend/src/sections/${sid}`)
    if (files.length > 0) sections.push({ id: sid, files })
  }

  return NextResponse.json({ modules: modulesOut, pages, sections })
}
