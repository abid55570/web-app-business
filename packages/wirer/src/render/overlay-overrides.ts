/**
 * Overlay step — copy every file under `<output>/overrides/` to its
 * matching path under `<output>/`, replacing the freshly-rendered
 * counterpart.
 *
 * The semantics: `overrides/` is a sibling directory inside the rendered
 * output that customers can drop files into. After every render, we walk
 * `overrides/` and copy each file to the same relative path one level up
 * — so `overrides/frontend/src/sections/HeroSplit/HeroSplit.tsx`
 * becomes `frontend/src/sections/HeroSplit/HeroSplit.tsx`.
 *
 * Why an overlay (not skip-when-present): the wirer can't see overrides
 * during the temp render because they live in the final dir's
 * `overrides/`, not in module sources. `promote.ts` preserves
 * `overrides/` across the temp → final rename; this overlay step then
 * applies them on top. Net effect: overrides win, generated files are
 * the fallback, and a regen never destroys customer customizations.
 *
 * We track every overlaid path in `.b-dash-overrides.json` next to the
 * version file so `b-dash upgrade` can detect conflicts (a file changed
 * in both the new render + an override).
 */
import { createHash } from 'node:crypto'
import { access, mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { copyFile } from 'node:fs/promises'
import path from 'node:path'


export type OverlaidFile = {
  /** Relative path in <output>/ — e.g. "frontend/src/sections/HeroSplit/HeroSplit.tsx" */
  relPath: string
  /** Bytes copied. */
  bytes: number
  /** sha256 of what the WIRER produced at this path (pre-overlay).
   * `null` when the override targets a path the wirer didn't write
   * (customer's pure-net-add file). */
  generatedHash: string | null
}


export type OverlayResult = {
  count: number
  files: OverlaidFile[]
  /** Absolute path to the overrides root that was walked. */
  overridesRoot: string
}


/**
 * Walk `<outputDir>/overrides/` recursively. For every regular file,
 * copy it to the matching relative path under `<outputDir>/`,
 * overwriting whatever the wirer just generated.
 *
 * Skips:
 *  - the `overrides/` directory itself (only its contents are processed)
 *  - dotfiles whose name begins with `.b-dash-` (treated as wirer-managed)
 *  - empty directories (mkdir is implicit on copy target)
 */
export async function overlayOverrides(outputDir: string): Promise<OverlayResult> {
  const overridesRoot = path.join(outputDir, 'overrides')
  const result: OverlayResult = {
    count: 0,
    files: [],
    overridesRoot,
  }

  if (!(await exists(overridesRoot))) {
    return result
  }

  await walk(overridesRoot, overridesRoot, outputDir, result)

  // Persist the manifest so `b-dash upgrade` can read it on the next round.
  // Schema v2: per-file `{ relPath, bytes, generatedHash }` so upgrade can
  // detect "generator-output-changed-under-an-override" conflicts.
  await writeFile(
    path.join(outputDir, '.b-dash-overrides.json'),
    JSON.stringify(
      {
        version: 2,
        generatedAt: new Date().toISOString(),
        count: result.count,
        files: [...result.files].sort((a, b) =>
          a.relPath.localeCompare(b.relPath),
        ),
      },
      null,
      2,
    ) + '\n',
    'utf-8',
  )

  return result
}


/**
 * Read the on-disk overrides manifest left by a previous render.
 *
 * Returns the per-file entries (v2 schema). For backwards compat, a v1
 * manifest (string array of paths) is upcast to entries with null hashes.
 * Returns `[]` if no manifest exists.
 */
export async function readOverridesManifest(
  outputDir: string,
): Promise<OverlaidFile[]> {
  const manifestPath = path.join(outputDir, '.b-dash-overrides.json')
  if (!(await exists(manifestPath))) return []
  try {
    const raw = await readFile(manifestPath, 'utf-8')
    const parsed = JSON.parse(raw)
    const files = parsed?.files
    if (!Array.isArray(files)) return []
    return files.map((f) =>
      typeof f === 'string'
        ? { relPath: f, bytes: 0, generatedHash: null }
        : {
            relPath: String(f.relPath ?? ''),
            bytes: Number(f.bytes ?? 0),
            generatedHash: f.generatedHash ?? null,
          },
    )
  } catch {
    return []
  }
}


async function walk(
  root: string,
  current: string,
  outputDir: string,
  result: OverlayResult,
): Promise<void> {
  const entries = await readdir(current, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.name.startsWith('.b-dash-')) continue
    const abs = path.join(current, entry.name)
    if (entry.isDirectory()) {
      await walk(root, abs, outputDir, result)
      continue
    }
    if (!entry.isFile()) continue
    // Compute path relative to overrides/ root, then mirror it into
    // outputDir/ (one level up from overrides/).
    const relFromOverrides = path.relative(root, abs)
    const dest = path.join(outputDir, relFromOverrides)
    // Hash the wirer's output BEFORE we overwrite it — that's the
    // "generated" baseline the upgrade command compares across runs.
    let generatedHash: string | null = null
    try {
      const buf = await readFile(dest)
      generatedHash = createHash('sha256').update(buf).digest('hex')
    } catch {
      // dest doesn't exist — override is a pure-net-add (e.g. customer
      // added a brand-new file the wirer never produces). No baseline.
    }
    await mkdir(path.dirname(dest), { recursive: true })
    await copyFile(abs, dest)
    const sz = await stat(abs)
    result.count += 1
    result.files.push({
      relPath: relFromOverrides.split(path.sep).join('/'),
      bytes: sz.size,
      generatedHash,
    })
  }
}


async function exists(p: string): Promise<boolean> {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}
