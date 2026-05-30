/**
 * `b-dash generate <recipe.json> [--out <dir>] [--modules <dir>] [--themes <dir>]
 *                                 [--install] [--smoke]`
 *
 * Builds a wire plan and renders it to disk. Defaults the output directory to
 * `<repo-root>/output/<recipe.id>/`.
 *
 * `--install`: after rendering, run `pnpm install` in `<out>/frontend/` and
 *              `pip install -e ".[dev]"` in `<out>/backend/`.
 * `--smoke`:   after install (or render if --install omitted), run
 *              `pytest tests/` in `<out>/backend/`. Exit non-zero if any
 *              smoke test fails.
 */
import { spawn } from 'node:child_process'
import { mkdir, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import kleur from 'kleur'
import { RecipeSchema, SchemaValidationError, loadAndValidate } from '@b-dash/schemas'
import {
  WirerError,
  buildWirePlan,
  render,
  scanModules,
  scanThemes,
} from '@b-dash/wirer'
import { createZip } from '../zip.js'

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
      // not readable
    }
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return null
}

type Args = {
  recipePath: string | null
  outDir: string | null
  modulesDir: string | null
  themesDir: string | null
  install: boolean
  smoke: boolean
  zip: boolean
}

function parseArgs(args: string[]): Args {
  let recipePath: string | null = null
  let outDir: string | null = null
  let modulesDir: string | null = null
  let themesDir: string | null = null
  let install = false
  let smoke = false
  let zip = false
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--out') {
      outDir = args[++i] ?? null
    } else if (a === '--modules') {
      modulesDir = args[++i] ?? null
    } else if (a === '--themes') {
      themesDir = args[++i] ?? null
    } else if (a === '--install') {
      install = true
    } else if (a === '--smoke') {
      smoke = true
    } else if (a === '--zip') {
      zip = true
    } else if (a && !a.startsWith('-') && recipePath === null) {
      recipePath = a
    }
  }
  return { recipePath, outDir, modulesDir, themesDir, install, smoke, zip }
}

/** Spawn a subprocess with stdio inherited; resolves with the exit code. */
async function runStep(
  label: string,
  cmd: string,
  cmdArgs: string[],
  cwd: string,
): Promise<number> {
  process.stdout.write(
    kleur.bold(`\n→ ${label}: `) +
      kleur.dim(`${cmd} ${cmdArgs.join(' ')}  (cwd: ${cwd})\n`),
  )
  return await new Promise<number>((resolve) => {
    const child = spawn(cmd, cmdArgs, {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    })
    child.on('exit', (code) => resolve(code ?? 0))
    child.on('error', (err) => {
      process.stderr.write(kleur.red(`✗ ${label} failed: ${err.message}\n`))
      resolve(1)
    })
  })
}

async function dirExists(p: string): Promise<boolean> {
  try {
    const s = await stat(p)
    return s.isDirectory()
  } catch {
    return false
  }
}

async function pathExists(p: string): Promise<boolean> {
  try {
    await stat(p)
    return true
  } catch {
    return false
  }
}

export async function runGenerate(args: string[]): Promise<number> {
  const parsed = parseArgs(args)

  if (!parsed.recipePath) {
    process.stderr.write(
      kleur.red(
        'Usage: b-dash generate <recipe.json> [--out <dir>] [--modules <dir>] [--themes <dir>]\n',
      ),
    )
    return 2
  }

  const repoRoot = await findRepoRoot(process.cwd())
  if (!repoRoot) {
    process.stderr.write(
      kleur.red(
        'Could not locate workspace root (no contracts/ + package.json upward).\n',
      ),
    )
    return 1
  }

  let recipe
  try {
    recipe = await loadAndValidate(RecipeSchema, parsed.recipePath, 'recipe')
  } catch (e) {
    if (e instanceof SchemaValidationError) {
      process.stderr.write(kleur.red('✗ ') + e.format() + '\n')
      return 1
    }
    throw e
  }

  const modulesDir = parsed.modulesDir ?? path.join(repoRoot, 'modules')
  const themesDir = parsed.themesDir ?? path.join(repoRoot, 'themes')
  // Sections live at <repo>/sections/ — auto-discovered, no flag needed.
  const sectionsDir = path.join(repoRoot, 'sections')
  const outDir =
    parsed.outDir ?? path.join(repoRoot, 'output', recipe.id)

  await mkdir(path.dirname(outDir), { recursive: true })

  const modules = await scanModules(modulesDir)
  const themes = await scanThemes(themesDir)

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

  process.stdout.write(
    kleur.bold(`Generating ${kleur.cyan(recipe.id)}\n`) +
      kleur.dim(`  output:  ${outDir}\n`) +
      kleur.dim(`  modules: ${modulesDir}\n`) +
      kleur.dim(`  theme:   ${plan.resolvedRecipe.theme.pack}\n`) +
      kleur.dim(`  ${plan.resolvedRecipe.modules.length} modules in topological order\n\n`),
  )

  let result
  try {
    result = await render({
      plan,
      modulesRoot: modulesDir,
      outputDir: outDir,
      sectionsRoot: sectionsDir,
    })
  } catch (e) {
    if (e instanceof WirerError) {
      process.stderr.write(kleur.red(`✗ [${e.code}] ${e.message}\n`))
      return 1
    }
    throw e
  }

  process.stdout.write(
    kleur.green(`✓ ${result.fileCount} files written across ${result.moduleCount} modules.\n`),
  )
  process.stdout.write(kleur.dim(`  cd ${outDir}\n`))

  if (parsed.install) {
    const frontendDir = path.join(outDir, 'frontend')
    const backendDir = path.join(outDir, 'backend')
    if (await dirExists(frontendDir)) {
      const code = await runStep('pnpm install', 'pnpm', ['install'], frontendDir)
      if (code !== 0) {
        process.stderr.write(kleur.red(`✗ pnpm install exited ${code}\n`))
        return code
      }
    }
    if (await dirExists(backendDir)) {
      const code = await runStep(
        'pip install',
        'pip',
        ['install', '-e', '.[dev]'],
        backendDir,
      )
      if (code !== 0) {
        process.stderr.write(kleur.red(`✗ pip install exited ${code}\n`))
        return code
      }
    }
  }

  if (parsed.smoke) {
    const backendDir = path.join(outDir, 'backend')
    const frontendDir = path.join(outDir, 'frontend')
    let ranAny = false

    // Stack-aware backend smoke. Django: run makemigrations first so
    // pytest-django can apply our schemas to the test DB; pytest discovers
    // tests via python_files (per-app tests/), no testpaths argument.
    // FastAPI: tests live in tests/ root, pytest tests -q.
    const isDjango = await pathExists(path.join(backendDir, 'manage.py'))
    if (isDjango) {
      const mm = await runStep(
        'makemigrations',
        'python',
        ['manage.py', 'makemigrations'],
        backendDir,
      )
      if (mm !== 0) {
        process.stderr.write(kleur.red(`✗ makemigrations exited ${mm}\n`))
        return mm
      }
      const code = await runStep('pytest', 'pytest', ['-q'], backendDir)
      if (code !== 0) {
        process.stderr.write(kleur.red(`✗ pytest exited ${code}\n`))
        return code
      }
      ranAny = true
    } else if (await dirExists(path.join(backendDir, 'tests'))) {
      const code = await runStep('pytest', 'pytest', ['tests', '-q'], backendDir)
      if (code !== 0) {
        process.stderr.write(kleur.red(`✗ pytest exited ${code}\n`))
        return code
      }
      ranAny = true
    }

    if (await dirExists(path.join(frontendDir, 'tests'))) {
      // Generate wipes node_modules — auto-install vitest deps if missing
      // when the operator asked for --smoke but not --install.
      if (
        !parsed.install &&
        !(await dirExists(path.join(frontendDir, 'node_modules')))
      ) {
        process.stdout.write(
          kleur.yellow(
            '⚠ frontend/node_modules missing; running pnpm install for --smoke\n',
          ),
        )
        const code = await runStep(
          'pnpm install',
          'pnpm',
          ['install'],
          frontendDir,
        )
        if (code !== 0) {
          process.stderr.write(kleur.red(`✗ pnpm install exited ${code}\n`))
          return code
        }
      }
      const code = await runStep(
        'vitest',
        'pnpm',
        ['vitest', 'run'],
        frontendDir,
      )
      if (code !== 0) {
        process.stderr.write(kleur.red(`✗ vitest exited ${code}\n`))
        return code
      }
      ranAny = true
    }

    if (!ranAny) {
      process.stdout.write(
        kleur.yellow('⚠ --smoke requested but no backend/tests/ or frontend/tests/ exists; skipping.\n'),
      )
    } else {
      process.stdout.write(kleur.green('✓ smoke tests passed.\n'))
    }
  }

  if (parsed.zip) {
    const zipPath = `${outDir}.zip`
    process.stdout.write(
      kleur.bold(`\n→ packaging: `) + kleur.dim(`${outDir} → ${zipPath}\n`),
    )
    const result = await createZip(outDir, zipPath)
    process.stdout.write(
      kleur.green(
        `✓ ${result.files} files packed into ${zipPath} (${(result.bytes / 1024).toFixed(1)} KB)\n`,
      ),
    )
  }

  return 0
}
