/**
 * Derive `<output>/backend/pyproject.toml` by merging the scaffold's base
 * pyproject with each module's `dependencies.backend` /
 * `dependencies.backendDev` (PEP 508 strings).
 *
 * We avoid pulling in a TOML parser dep — only two arrays are mutated, so we
 * patch them in-place via line-anchored regex against the canonical scaffold
 * shape. If the scaffold ever drifts away from that shape, the test below
 * catches the regression.
 */
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { WirePlan } from '../types.js'

export type DerivePyprojectArgs = {
  plan: WirePlan
  outputDir: string
}

export async function derivePyproject(
  args: DerivePyprojectArgs,
): Promise<string | null> {
  const dest = path.join(args.outputDir, 'backend', 'pyproject.toml')

  let original: string
  try {
    original = await readFile(dest, 'utf-8')
  } catch {
    return null
  }

  // Collect deps from all modules.
  const extraMain: string[] = []
  const extraDev: string[] = []
  for (const m of args.plan.resolvedRecipe.modules) {
    const md = m.manifest.dependencies
    if (!md) continue
    for (const dep of md.backend ?? []) {
      extraMain.push(`    "${dep}",  # from ${m.id}`)
    }
    for (const dep of md.backendDev ?? []) {
      extraDev.push(`    "${dep}",  # from ${m.id}`)
    }
  }

  const updated = mergeIntoArray(
    mergeIntoArray(original, 'dependencies', extraMain),
    'dev',
    extraDev,
  )

  // Also rename project name to match recipe id for npm-parity ergonomics.
  const renamed = updated.replace(
    /^name\s*=\s*"[^"]*"/m,
    `name = "${pyProjectName(args.plan.resolvedRecipe.recipe.id)}-backend"`,
  )

  await writeFile(dest, renamed, 'utf-8')
  return dest
}

/**
 * Inject extra entries before the closing `]` of an array assignment.
 * Looks for: `<key> = [` ... `\n]`. The `[\s\S]*?` non-greedy match tolerates
 * inline `]` inside dep strings (e.g. `"uvicorn[standard]>=0.32.0"`); the
 * `\n]` boundary requires the closing bracket to sit on its own line, which
 * is how the scaffold is formatted.
 */
function mergeIntoArray(
  toml: string,
  key: string,
  extraLines: string[],
): string {
  if (extraLines.length === 0) return toml

  const re = new RegExp(
    `(^${escapeRe(key)}\\s*=\\s*\\[[\\s\\S]*?)(\\n\\])`,
    'm',
  )
  if (!re.test(toml)) {
    // eslint-disable-next-line no-console
    console.warn(
      `[wirer] derive-pyproject: array "${key}" not found in pyproject.toml — skipping ${extraLines.length} entries`,
    )
    return toml
  }
  return toml.replace(re, `$1\n${extraLines.join('\n')}$2`)
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function pyProjectName(recipeId: string): string {
  return recipeId
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '')
}
