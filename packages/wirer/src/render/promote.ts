/**
 * Atomic temp → output promotion.
 *
 *   1. Render writes everything into <output>.tmp.<timestamp>/
 *   2. On success: remove existing <output>/ (preserving overrides/), then rename
 *   3. On failure: remove the temp dir, leave existing <output>/ untouched
 *
 * `overrides/` lives OUTSIDE the temp dir (sits next to <output>), so it
 * naturally survives — see PLAN §15 / §17.
 */
import { access, cp, mkdir, rename, rm } from 'node:fs/promises'
import path from 'node:path'

export async function promote(tempDir: string, finalDir: string): Promise<void> {
  // Stash overrides/ if it exists in the EXISTING final dir, so we can keep it.
  const existingOverrides = path.join(finalDir, 'overrides')
  let savedOverrides: string | null = null
  if (await exists(existingOverrides)) {
    savedOverrides = `${finalDir}.overrides.bak.${Date.now()}`
    await rename(existingOverrides, savedOverrides)
  }

  // Wipe the existing final dir (we have backed up overrides if any).
  if (await exists(finalDir)) {
    await rm(finalDir, { recursive: true, force: true })
  }

  // Atomic rename of temp -> final.
  await rename(tempDir, finalDir)

  // Restore overrides (and an empty stub if there were none).
  if (savedOverrides) {
    await rename(savedOverrides, path.join(finalDir, 'overrides'))
  } else {
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
