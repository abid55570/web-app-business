/**
 * Temp → output promotion via per-entry merge.
 *
 * Why "merge" instead of "rm finalDir + rename tempDir → finalDir":
 *   On Windows, when the user has `pnpm dev` running, Next.js holds open
 *   handles on `frontend/.next/trace` etc. Renaming or removing that
 *   directory fails with EPERM, which would kill every Studio save.
 *
 *   The merge-tree approach NEVER touches paths that aren't in tempDir.
 *   The wirer doesn't emit node_modules/, .next/, .venv/, or .git/, so
 *   those naturally survive without us having to special-case them.
 *
 * Algorithm (`mergeTree(src, dest)`):
 *   1. For each entry under src:
 *      - If both src/<e> and dest/<e> are directories, recurse into them
 *        (preserves any subdirs that only exist in dest).
 *      - Otherwise, remove dest/<e> if it exists, then `rename` src/<e> in.
 *   2. After recursion, the now-empty src is `rm`'d.
 *
 * Atomicity: each individual file/dir move is atomic (rename), but the
 * whole promotion is not — a crash mid-merge leaves a partial tree.
 * Acceptable trade-off; the alternative (block dev servers) is worse for
 * the Studio interactive loop. Failed renders leave tempDir untouched
 * and rollback() removes it.
 *
 * See PLAN §15 / §17.
 */
import { access, mkdir, readdir, rename, rm, stat } from 'node:fs/promises'
import path from 'node:path'

export async function promote(tempDir: string, finalDir: string): Promise<void> {
  // Make sure finalDir exists so the first-time merge has a target.
  await mkdir(finalDir, { recursive: true })

  // Merge every leaf from tempDir into finalDir. Paths that only exist
  // in finalDir (node_modules, .next, .venv, .git, overrides) are
  // preserved because they're never visited.
  await mergeTree(tempDir, finalDir)

  // tempDir should be empty now; remove the husk.
  await rm(tempDir, { recursive: true, force: true })

  // Studio expects an overrides/ stub to exist even when empty so file
  // saves don't need to mkdir the parent.
  await mkdir(path.join(finalDir, 'overrides'), { recursive: true })
}

export async function rollback(tempDir: string): Promise<void> {
  await rm(tempDir, { recursive: true, force: true }).catch(() => {
    /* best-effort */
  })
}

/**
 * Recursive per-entry merge. Both src and dest must already exist.
 *
 * For each child of src:
 *   - If both src/<name> and dest/<name> are directories → recurse.
 *   - If either is a file (or only src exists) → atomically replace dest's
 *     entry with src's via `rm` + `rename`.
 *
 * Any path that exists in dest but NOT in src is left untouched. That
 * preserves frontend/node_modules, frontend/.next, backend/.venv, .git,
 * and overrides/ across regens with zero special-casing.
 */
async function mergeTree(src: string, dest: string): Promise<void> {
  const entries = await readdir(src, { withFileTypes: true })
  for (const e of entries) {
    const srcPath = path.join(src, e.name)
    const destPath = path.join(dest, e.name)
    const destStat = await safeStat(destPath)

    if (e.isDirectory() && destStat?.isDirectory()) {
      // Both are directories — recurse so we preserve sibling subdirs
      // (e.g. recurse into frontend/, replace frontend/src + frontend/
      // package.json, leave frontend/node_modules alone).
      await mergeTree(srcPath, destPath)
      continue
    }

    // Otherwise replace dest with src as one atomic unit.
    if (destStat) {
      await rm(destPath, { recursive: true, force: true }).catch(async (err: unknown) => {
        // On Windows, EPERM means a file/dir is locked by another process
        // (e.g. Next dev's webpack cache). Retry once after a tiny wait —
        // chunks often release within ~50ms.
        const code = (err as { code?: string } | undefined)?.code
        if (code === 'EPERM' || code === 'EBUSY') {
          await sleep(80)
          await rm(destPath, { recursive: true, force: true }).catch(() => {
            // Give up silently; the rename below will surface the real error.
          })
        } else {
          throw err
        }
      })
    }

    try {
      await rename(srcPath, destPath)
    } catch (err) {
      const code = (err as { code?: string } | undefined)?.code
      if (code === 'EPERM' || code === 'EBUSY') {
        // Last-ditch retry. If this still fails, the dev server is
        // holding the file open — let the caller decide what to do.
        await sleep(120)
        await rename(srcPath, destPath)
      } else {
        throw err
      }
    }
  }
}

async function safeStat(p: string): Promise<import('node:fs').Stats | null> {
  try {
    return await stat(p)
  } catch {
    return null
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

function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms))
}

// Re-export `exists` so existing callers (none currently, but kept for parity
// with the prior promote.ts API) don't break if they imported it.
export { exists }
