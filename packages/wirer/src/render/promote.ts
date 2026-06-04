/**
 * Atomic temp → output promotion.
 *
 *   1. Render writes everything into <output>.tmp.<timestamp>/
 *   2. On success: stash long-lived artifacts (overrides/, frontend/node_modules,
 *      frontend/.next, backend/.venv, .git) from the existing <output>/,
 *      wipe it, rename temp → output, restore the stashed artifacts.
 *   3. On failure: remove the temp dir, leave existing <output>/ untouched
 *
 * The "stash + restore" pattern keeps the user's installed dependencies +
 * git history alive across regens. Without it, every Studio save would
 * require a multi-minute `pnpm install` before the FE can boot again.
 *
 * See PLAN §15 / §17 — overrides/ is the primary preserve, the rest are
 * Sprint 6 additions to make Studio's save→regen→reload loop usable.
 */
import { access, mkdir, rename, rm } from 'node:fs/promises'
import path from 'node:path'

/** Relative paths under finalDir that must survive a regen if present. */
const PRESERVE = [
  'overrides',
  'frontend/node_modules',
  'frontend/.next',
  'backend/.venv',
  '.git',
]

export async function promote(tempDir: string, finalDir: string): Promise<void> {
  // 1. Stash any preserved paths from the EXISTING finalDir to sibling backups.
  const stamp = Date.now()
  const stashes: Array<{ rel: string; backup: string }> = []
  for (const rel of PRESERVE) {
    const abs = path.join(finalDir, rel)
    if (await exists(abs)) {
      // Use one backup root per rename so we don't collide on names.
      const backup = `${finalDir}.preserve.${stamp}.${rel.replace(/[\\/]/g, '__')}`
      await rename(abs, backup)
      stashes.push({ rel, backup })
    }
  }

  // 2. Wipe the existing final dir.
  if (await exists(finalDir)) {
    await rm(finalDir, { recursive: true, force: true })
  }

  // 3. Atomic rename of temp -> final.
  await rename(tempDir, finalDir)

  // 4. Restore the stashed paths. overrides/ gets an empty stub if there
  //    was nothing to restore — every output must have one.
  let hadOverrides = false
  for (const { rel, backup } of stashes) {
    const dest = path.join(finalDir, rel)
    // Make the parent dir if it doesn't exist (e.g. frontend/ might be
    // brand-new after a fresh wirer run, and we need frontend/node_modules).
    await mkdir(path.dirname(dest), { recursive: true })
    // The destination shouldn't exist (we just wrote the temp dir fresh),
    // but if it does (e.g. wirer emitted overrides/ stub), wipe first.
    if (await exists(dest)) {
      await rm(dest, { recursive: true, force: true })
    }
    await rename(backup, dest)
    if (rel === 'overrides') hadOverrides = true
  }
  if (!hadOverrides) {
    await mkdir(path.join(finalDir, 'overrides'), { recursive: true })
  }
}

export async function rollback(tempDir: string): Promise<void> {
  await rm(tempDir, { recursive: true, force: true }).catch(() => {
    /* best-effort */
  })
}

async function exists(p: string): Promise<boolean> {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}
