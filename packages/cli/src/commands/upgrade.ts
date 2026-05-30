/**
 * `b-dash upgrade <project-dir>`
 *
 * Re-runs the generator on an already-generated app, using the recipe.json
 * already inside `<project-dir>/recipe.json`. The wirer's overlay step
 * automatically re-applies anything customers put under `overrides/`,
 * so a customer who only changes overrides keeps their changes.
 *
 * The upgrade command goes one step further: it diffs the generated
 * output (= what the wirer would produce WITHOUT overrides) before and
 * after the regen, and flags overrides whose underlying generator file
 * changed shape. That's the "conflict" — the override might be patching
 * a function that no longer exists in the new render.
 *
 *   ./project/
 *     recipe.json              ← source of truth (regen input)
 *     overrides/               ← customer files (overlaid after regen)
 *     backend/, frontend/, ... ← generated, will be replaced
 *     .b-dash-overrides.json   ← manifest written by the wirer
 *
 * Output: a printed report. Non-zero exit only when a hard error blocks
 * the regen (recipe invalid, modules missing). Conflicts alone print a
 * warning + return 0 so CI flows can run them automatically.
 */
import { createHash } from 'node:crypto'
import {
  access,
  readFile,
  readdir,
  stat,
} from 'node:fs/promises'
import path from 'node:path'
import kleur from 'kleur'
import {
  RecipeSchema,
  SchemaValidationError,
  loadAndValidate,
} from '@b-dash/schemas'
import {
  WirerError,
  buildUpgradeReport,
  buildWirePlan,
  readOverridesManifest,
  render,
  scanModules,
  scanThemes,
  type UpgradeReport,
} from '@b-dash/wirer'


async function findRepoRoot(start: string): Promise<string | null> {
  let dir = start
  const root = path.parse(dir).root
  while (dir !== root) {
    try {
      const entries = await readdir(dir)
      if (
        entries.includes('contracts') &&
        entries.includes('package.json') &&
        entries.includes('modules')
      ) {
        return dir
      }
    } catch {
      /* not readable */
    }
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return null
}


async function exists(p: string): Promise<boolean> {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}


/** Walk every regular file under `root`, skipping `overrides/` + wirer
 * dotfiles. Returns relPath → sha256 hex.
 */
async function snapshotTree(root: string): Promise<Map<string, string>> {
  const out = new Map<string, string>()
  await walk(root, root, out)
  return out
}


async function walk(
  root: string,
  current: string,
  out: Map<string, string>,
): Promise<void> {
  const entries = await readdir(current, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.name === 'overrides') continue
    if (entry.name === 'node_modules') continue
    if (entry.name.startsWith('.b-dash-')) continue
    const abs = path.join(current, entry.name)
    if (entry.isDirectory()) {
      await walk(root, abs, out)
      continue
    }
    if (!entry.isFile()) continue
    const rel = path
      .relative(root, abs)
      .split(path.sep)
      .join('/')
    const buf = await readFile(abs)
    out.set(rel, createHash('sha256').update(buf).digest('hex'))
  }
}


export async function runUpgrade(args: string[]): Promise<number> {
  const projectDir = args[0] ? path.resolve(args[0]) : process.cwd()
  if (!(await exists(projectDir))) {
    process.stderr.write(
      kleur.red(`Project directory not found: ${projectDir}\n`),
    )
    return 1
  }

  const recipePath = path.join(projectDir, 'recipe.json')
  if (!(await exists(recipePath))) {
    process.stderr.write(
      kleur.red(
        `No recipe.json found at ${recipePath}. ` +
          `Did you run \`b-dash generate\` here first?\n`,
      ),
    )
    return 1
  }

  const repoRoot = await findRepoRoot(process.cwd())
  if (!repoRoot) {
    process.stderr.write(
      kleur.red(
        'Could not locate the B-Dash workspace root (need contracts/ + modules/ + package.json).\n',
      ),
    )
    return 1
  }

  // 1. Parse the existing recipe.
  let recipe
  try {
    recipe = await loadAndValidate(RecipeSchema, recipePath, 'recipe')
  } catch (e) {
    if (e instanceof SchemaValidationError) {
      process.stderr.write(kleur.red(`Recipe invalid: ${e.message}\n`))
      return 2
    }
    throw e
  }

  process.stdout.write(
    kleur.bold(`Upgrading ${recipe.id}\n`) +
      `  project:  ${kleur.cyan(projectDir)}\n` +
      `  workspace:${kleur.dim(' ')}${kleur.cyan(repoRoot)}\n\n`,
  )

  // 2. Snapshot the existing tree + read the prior overrides manifest +
  //    the prior module-version manifest (for changelog-aware bump reporting).
  const before = await snapshotTree(projectDir)
  const priorOverrides = await readOverridesManifest(projectDir)
  const priorVersions = await readModulesManifest(projectDir)

  // 3. Re-render in place. The wirer's overlay step re-applies overrides/.
  const modulesRoot = path.join(repoRoot, 'modules')
  const themesRoot = path.join(repoRoot, 'themes')
  const sectionsRoot = path.join(repoRoot, 'sections')

  const modules = await scanModules(modulesRoot)
  const themes = await scanThemes(themesRoot)

  let plan
  try {
    plan = buildWirePlan({ recipe, modules, themes })
  } catch (e) {
    const msg = e instanceof WirerError ? e.message : (e as Error).message
    process.stderr.write(kleur.red(`Wire plan failed: ${msg}\n`))
    return 1
  }

  let result
  try {
    result = await render({
      plan,
      modulesRoot,
      outputDir: projectDir,
      sectionsRoot: (await exists(sectionsRoot)) ? sectionsRoot : undefined,
    })
  } catch (e) {
    const msg = e instanceof WirerError ? e.message : (e as Error).message
    process.stderr.write(kleur.red(`Render failed: ${msg}\n`))
    return 1
  }

  // 4. Snapshot the new tree + diff.
  const after = await snapshotTree(projectDir)
  const changed: string[] = []
  const added: string[] = []
  const removed: string[] = []

  for (const [rel, hash] of after) {
    const prior = before.get(rel)
    if (prior == null) added.push(rel)
    else if (prior !== hash) changed.push(rel)
  }
  for (const rel of before.keys()) {
    if (!after.has(rel)) removed.push(rel)
  }

  // 5. Conflicts — detected by comparing the wirer's pre-overlay output
  //    hash for each override between the prior render and this one.
  //    If it shifted, the override may be patching a function that no
  //    longer exists in the new render → flag for review.
  //
  //    The manifest stores `generatedHash` per override (v2 schema). We
  //    compare prior.generatedHash vs current.generatedHash; mismatch =
  //    conflict.
  // 5a. Categorize module version bumps via CHANGELOG.md.
  const currentVersions = Object.fromEntries(
    plan.resolvedRecipe.modules.map((m) => [m.id, m.manifest.version]),
  )
  const upgradeReport = await buildUpgradeReport({
    priorVersions,
    currentVersions,
    modulesRoot,
  })

  const priorByPath = new Map(priorOverrides.map((o) => [o.relPath, o]))
  const conflicts: string[] = []
  const newOverrides = result.overrides.map((o) => o.relPath)
  for (const o of result.overrides) {
    const prior = priorByPath.get(o.relPath)
    if (!prior) continue // brand-new override — no prior baseline
    if (prior.generatedHash == null || o.generatedHash == null) continue
    if (prior.generatedHash !== o.generatedHash) {
      conflicts.push(o.relPath)
    }
  }

  // 6. Report.
  printReport({
    recipeId: recipe.id,
    fileCount: result.fileCount,
    overrides: newOverrides,
    changed,
    added,
    removed,
    conflicts,
    upgradeReport,
  })
  return 0
}


async function readModulesManifest(
  outputDir: string,
): Promise<Record<string, string>> {
  const p = path.join(outputDir, '.b-dash-modules.json')
  if (!(await exists(p))) return {}
  try {
    const raw = await readFile(p, 'utf-8')
    const parsed = JSON.parse(raw)
    return typeof parsed?.modules === 'object' && parsed.modules !== null
      ? (parsed.modules as Record<string, string>)
      : {}
  } catch {
    return {}
  }
}


function printReport(args: {
  recipeId: string
  fileCount: number
  overrides: string[]
  changed: string[]
  added: string[]
  removed: string[]
  conflicts: string[]
  upgradeReport: UpgradeReport
}): void {
  const w = (s: string) => process.stdout.write(s)
  w(kleur.bold('Upgrade complete\n'))
  w(`  recipe:   ${kleur.cyan(args.recipeId)}\n`)
  w(`  files:    ${kleur.cyan(String(args.fileCount))} written by wirer\n`)
  w(
    `  changes:  ${kleur.green(`+${args.added.length}`)} added, ` +
      `${kleur.yellow(`~${args.changed.length}`)} changed, ` +
      `${kleur.red(`-${args.removed.length}`)} removed\n`,
  )
  w(
    `  overrides: ${kleur.cyan(String(args.overrides.length))} overlaid from overrides/\n`,
  )
  if (args.conflicts.length === 0) {
    w(kleur.green('  conflicts: none — every override applied cleanly.\n'))
  } else {
    w(
      kleur.yellow(
        `  conflicts: ${args.conflicts.length} — these paths changed in the regen AND carry an override.\n`,
      ),
    )
    w(
      kleur.dim(
        '  Review the override against the new generated output to ensure it still applies:\n',
      ),
    )
    for (const c of args.conflicts) {
      w(`    ${kleur.yellow(c)}\n`)
    }
  }

  // Module version bumps from CHANGELOG.md parsing.
  const r = args.upgradeReport
  const total =
    r.safeCount + r.reviewCount + r.breakingCount + r.unknownCount
  w('\n')
  if (r.bumps.length === 0) {
    w(
      kleur.dim('  module-bumps: none — every module is at the same version as last render.\n'),
    )
    return
  }
  w(
    kleur.bold(
      `  module-bumps: ${r.bumps.length} module(s) bumped — ${total} changelog entries\n`,
    ),
  )
  w(
    `    ${kleur.green(`safe=${r.safeCount}`)}   ` +
      `${kleur.yellow(`review=${r.reviewCount}`)}   ` +
      `${kleur.red(`breaking=${r.breakingCount}`)}   ` +
      `${kleur.dim(`unknown=${r.unknownCount}`)}\n`,
  )
  for (const bump of r.bumps) {
    const from = bump.fromVersion ?? kleur.dim('(new install)')
    w(
      `    ${kleur.cyan(bump.moduleId)} ${kleur.dim(from + ' → ')}${kleur.bold(bump.toVersion)}\n`,
    )
    for (const e of bump.entries) {
      const color =
        e.severity === 'breaking'
          ? kleur.red
          : e.severity === 'review'
            ? kleur.yellow
            : e.severity === 'safe'
              ? kleur.green
              : kleur.dim
      w(
        `      ${color(`[${e.severity}]`)} ${e.message} ${kleur.dim(`(v${e.version})`)}\n`,
      )
    }
  }
  if (r.breakingCount > 0) {
    w(
      '\n' +
        kleur.red.bold(
          `  ⚠ ${r.breakingCount} breaking change(s) — review carefully before deploying.\n`,
        ),
    )
  }
}
