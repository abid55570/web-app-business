/**
 * `b-dash new --from <starter> [--out <dir>] [--name <brand>] [--install] [--smoke]`
 *
 * One-shot scaffolder: picks a starter from `starters/<from>/recipe.json`,
 * optionally overrides `branding.name` + `id`, writes the resulting recipe
 * into <out>/recipe.json, then runs `generate` on it.
 *
 * --install / --smoke flow through to generate.
 *
 * Example:
 *   b-dash new --from saas-jwt --out ./acme --name "Acme Cloud"
 */
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import kleur from 'kleur'
import { runGenerate } from './generate.js'


async function findStartersDir(start: string): Promise<string | null> {
  let dir = start
  const root = path.parse(dir).root
  while (dir !== root) {
    const candidate = path.join(dir, 'starters')
    try {
      const entries = await readdir(candidate)
      if (entries.length > 0) return candidate
    } catch {
      // not here; walk up
    }
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return null
}


function kebab(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/--+/g, '-')
}


function parseFlags(args: string[]): {
  from?: string
  out?: string
  name?: string
  install: boolean
  smoke: boolean
} {
  let from: string | undefined
  let out: string | undefined
  let name: string | undefined
  let install = false
  let smoke = false
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--from') from = args[++i]
    else if (a === '--out') out = args[++i]
    else if (a === '--name') name = args[++i]
    else if (a === '--install') install = true
    else if (a === '--smoke') smoke = true
  }
  return { from, out, name, install, smoke }
}


export async function runNew(args: string[]): Promise<number> {
  const flags = parseFlags(args)

  if (!flags.from) {
    process.stderr.write(
      kleur.red('Usage: b-dash new --from <starter> [--out <dir>] [--name <brand>] [--install] [--smoke]\n') +
        kleur.dim('Run `b-dash list starters` to see options.\n'),
    )
    return 2
  }

  const startersDir = await findStartersDir(process.cwd())
  if (!startersDir) {
    process.stderr.write(
      kleur.red('No starters/ directory found in the current workspace.\n'),
    )
    return 1
  }

  const recipePath = path.join(startersDir, flags.from, 'recipe.json')
  let raw: string
  try {
    raw = await readFile(recipePath, 'utf8')
  } catch {
    process.stderr.write(
      kleur.red(`Starter '${flags.from}' not found at ${recipePath}\n`) +
        kleur.dim('Run `b-dash list starters` to see available starters.\n'),
    )
    return 1
  }

  const recipe = JSON.parse(raw) as Record<string, unknown>

  // Override branding + id when --name supplied
  if (flags.name) {
    const slug = kebab(flags.name)
    recipe.id = slug || (recipe.id as string)
    const branding = (recipe.branding as Record<string, unknown> | undefined) ?? {}
    branding.name = flags.name
    recipe.branding = branding
  }

  // Resolve output dir: --out, else <cwd>/<recipe.id>
  const outDir = path.resolve(
    flags.out ?? path.join(process.cwd(), String(recipe.id)),
  )
  await mkdir(outDir, { recursive: true })

  // Write the customised recipe into <out>/recipe.json so the user can iterate.
  const newRecipePath = path.join(outDir, 'recipe.json')
  await writeFile(newRecipePath, JSON.stringify(recipe, null, 2) + '\n', 'utf8')

  process.stdout.write(
    kleur.bold(`Scaffolding from starter '${flags.from}'\n`) +
      `  recipe:  ${kleur.cyan(newRecipePath)}\n` +
      `  output:  ${kleur.cyan(outDir)}\n` +
      (flags.name ? `  name:    ${kleur.cyan(flags.name)}\n` : '') +
      '\n',
  )

  // Hand off to generate; it owns wirer + install + smoke flow.
  const genArgs = [newRecipePath, '--out', outDir]
  if (flags.install) genArgs.push('--install')
  if (flags.smoke) genArgs.push('--smoke')

  return runGenerate(genArgs)
}
