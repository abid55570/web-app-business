/**
 * `b-dash diff <recipe.json>`
 *
 * Builds a wire plan for the given recipe against the workspace's
 * `modules/` + `themes/` inventory and prints what the wirer would do.
 *
 * Exit codes:
 *   0 = clean plan
 *   1 = conflicts detected, or wirer/schema error
 *   2 = bad CLI usage
 */
import { readdir } from 'node:fs/promises'
import path from 'node:path'
import kleur from 'kleur'
import { RecipeSchema, SchemaValidationError, loadAndValidate } from '@b-dash/schemas'
import {
  WirerError,
  buildWirePlan,
  scanModules,
  scanThemes,
} from '@b-dash/wirer'

async function findRepoRoot(start: string): Promise<string | null> {
  let dir = start
  const root = path.parse(dir).root
  while (dir !== root) {
    try {
      const entries = await readdir(dir)
      if (entries.includes('contracts') && entries.includes('package.json')) {
        return dir
      }
    } catch {
      // not readable; walk up
    }
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return null
}

export async function runDiff(args: string[]): Promise<number> {
  const recipePath = args[0]
  if (!recipePath) {
    process.stderr.write(kleur.red('Usage: b-dash diff <recipe.json>\n'))
    return 2
  }

  const repoRoot = await findRepoRoot(process.cwd())
  if (!repoRoot) {
    process.stderr.write(
      kleur.red(
        'Could not locate workspace root (no contracts/ + package.json found upward).\n',
      ),
    )
    return 1
  }

  let recipe
  try {
    recipe = await loadAndValidate(RecipeSchema, recipePath, 'recipe')
  } catch (e) {
    if (e instanceof SchemaValidationError) {
      process.stderr.write(kleur.red('✗ ') + e.format() + '\n')
      return 1
    }
    throw e
  }

  const modules = await scanModules(path.join(repoRoot, 'modules'))
  const themes = await scanThemes(path.join(repoRoot, 'themes'))

  let plan
  try {
    plan = buildWirePlan({ recipe, modules, themes })
  } catch (e) {
    if (e instanceof WirerError) {
      process.stderr.write(kleur.red(`✗ [${e.code}] ${e.message}\n`))
      return 1
    }
    throw e
  }

  // Pretty-print the plan
  const out = process.stdout
  out.write(kleur.bold(`Wire plan for ${kleur.cyan(recipe.id)}:\n\n`))
  out.write(
    `  ${kleur.bold('Stack:')}    ${recipe.stack.backend} + ${recipe.stack.frontend} + ${recipe.stack.database}\n`,
  )
  out.write(`  ${kleur.bold('Theme:')}    ${plan.resolvedRecipe.theme.pack}\n`)
  out.write(
    `  ${kleur.bold('Modules:')}  ${plan.resolvedRecipe.modules.length} (in topological order)\n`,
  )
  for (const m of plan.resolvedRecipe.modules) {
    out.write(`    • ${m.id} ${kleur.dim(`v${m.version}`)}\n`)
  }
  const emitterCount = Object.keys(plan.emitters).length
  out.write(`  ${kleur.bold('Events emitted:')}    ${emitterCount}\n`)
  for (const evt of Object.keys(plan.emitters).sort()) {
    out.write(
      `    • ${kleur.cyan(evt)} ${kleur.dim('←')} ${(plan.emitters[evt] ?? []).join(', ')}\n`,
    )
  }
  const subscriberCount = Object.keys(plan.subscribers).length
  out.write(`  ${kleur.bold('Events subscribed:')} ${subscriberCount}\n`)
  for (const evt of Object.keys(plan.subscribers).sort()) {
    out.write(
      `    • ${kleur.cyan(evt)} ${kleur.dim('→')} ${(plan.subscribers[evt] ?? []).join(', ')}\n`,
    )
  }
  out.write(`  ${kleur.bold('Permissions:')}      ${plan.permissions.length}\n`)
  for (const p of plan.permissions) {
    out.write(`    • ${p}\n`)
  }

  if (plan.conflicts.length > 0) {
    process.stderr.write(
      kleur.red(`\n  ✗ ${plan.conflicts.length} file conflict(s):\n`),
    )
    for (const c of plan.conflicts) {
      process.stderr.write(
        kleur.red(
          `    • ${c.path} contributed by: ${c.contributors.join(', ')}\n`,
        ),
      )
    }
    return 1
  }

  out.write(kleur.green('\n  ✓ No file conflicts. Plan is ready to wire.\n'))
  return 0
}
