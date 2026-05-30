/**
 * `b-dash wizard` — interactive recipe builder.
 *
 * Walks the operator through a small fixed set of questions (name, archetype,
 * vertical, stack, theme, modules) and writes a valid recipe.json. Optional
 * ``--out <path>`` overrides the default ``<repo>/recipes/<id>.json``.
 *
 * Phase 1 MVP — uses native readline, no extra deps. Good enough to demo
 * the contract → recipe → generator pipeline end-to-end. Phase 2 swaps in a
 * richer TUI (autocomplete, multi-select, dynamic question flow).
 */
import { mkdir, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import kleur from 'kleur'
import { scanModules, scanThemes } from '@b-dash/wirer'

const ARCHETYPES = [
  'business',
  'productivity',
  'content',
  'social',
  'marketplace',
  'tools',
  'education',
  'dashboard',
  'creator',
  'tracker',
  'realtime',
  'game',
  'custom',
] as const

type Args = {
  outPath: string | null
  modulesDir: string | null
  themesDir: string | null
}

function parseArgs(args: string[]): Args {
  let outPath: string | null = null
  let modulesDir: string | null = null
  let themesDir: string | null = null
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--out') outPath = args[++i] ?? null
    else if (a === '--modules') modulesDir = args[++i] ?? null
    else if (a === '--themes') themesDir = args[++i] ?? null
  }
  return { outPath, modulesDir, themesDir }
}

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
      /* unreadable dir, keep walking */
    }
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return null
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function runWizard(args: string[]): Promise<number> {
  const parsed = parseArgs(args)

  const repoRoot = await findRepoRoot(process.cwd())
  if (!repoRoot) {
    process.stderr.write(
      kleur.red(
        'Could not locate workspace root (no contracts/ + package.json upward).\n',
      ),
    )
    return 1
  }

  const modulesDir = parsed.modulesDir ?? path.join(repoRoot, 'modules')
  const themesDir = parsed.themesDir ?? path.join(repoRoot, 'themes')

  const [allModules, allThemes] = await Promise.all([
    scanModules(modulesDir),
    scanThemes(themesDir),
  ])

  // Filter out deprecated modules from the wizard pick-list — operators
  // shouldn't be nudged toward end-of-life modules.
  const liveModules = allModules
    .filter((m) => m.manifest.deprecated !== true)
    .sort((a, b) => a.id.localeCompare(b.id))

  const rl = createInterface({ input, output })

  const ask = async (
    prompt: string,
    fallback?: string,
  ): Promise<string> => {
    const suffix = fallback ? kleur.dim(` [${fallback}]`) : ''
    const ans = (await rl.question(`${kleur.cyan(prompt)}${suffix}: `)).trim()
    return ans === '' && fallback !== undefined ? fallback : ans
  }

  const askChoice = async <T extends string>(
    prompt: string,
    choices: readonly T[],
    fallback: T,
  ): Promise<T> => {
    const list = choices
      .map((c) => (c === fallback ? kleur.bold().green(c) : c))
      .join(' / ')
    const ans = (
      await rl.question(`${kleur.cyan(prompt)} (${list}) [${fallback}]: `)
    )
      .trim()
      .toLowerCase()
    if (ans === '') return fallback
    if ((choices as readonly string[]).includes(ans)) return ans as T
    process.stdout.write(
      kleur.yellow(`  unrecognised "${ans}", using ${fallback}\n`),
    )
    return fallback
  }

  const askMulti = async (
    prompt: string,
    options: { id: string; label: string }[],
    defaultIds: string[],
  ): Promise<string[]> => {
    process.stdout.write(`${kleur.cyan(prompt)}\n`)
    options.forEach((o, i) => {
      const sel = defaultIds.includes(o.id) ? kleur.green('●') : kleur.dim('○')
      process.stdout.write(`  ${sel} ${i + 1}. ${o.id}  ${kleur.dim(o.label)}\n`)
    })
    const ans = (
      await rl.question(
        kleur.dim(
          '  comma-separated indices, "all", or empty to accept defaults: ',
        ),
      )
    ).trim()
    if (ans === '') return defaultIds
    if (ans === 'all') return options.map((o) => o.id)
    const ids: string[] = []
    for (const tok of ans.split(',')) {
      const n = Number.parseInt(tok.trim(), 10)
      if (Number.isFinite(n) && n >= 1 && n <= options.length) {
        ids.push(options[n - 1].id)
      }
    }
    return ids.length > 0 ? ids : defaultIds
  }

  process.stdout.write(
    kleur.bold('\n🧙  b-dash wizard\n') +
      kleur.dim('   Press <enter> to accept the default in [brackets].\n\n'),
  )

  try {
    const name = await ask('App name', 'My App')
    const id = slugify(await ask('App id (kebab-case)', slugify(name)))
    const archetype = await askChoice(
      'Archetype',
      ARCHETYPES,
      'business',
    )
    const vertical = await ask(
      'Vertical (e.g. restaurant, gym, agency — leave blank to skip)',
      '',
    )

    const backend = await askChoice(
      'Backend stack',
      ['fastapi', 'django'] as const,
      'fastapi',
    )
    const frontend = await askChoice(
      'Frontend stack',
      ['nextjs', 'remix'] as const,
      'nextjs',
    )
    const database = await askChoice(
      'Database',
      ['postgres', 'sqlite', 'mysql'] as const,
      'postgres',
    )

    const themeId = await askChoice(
      'Theme',
      (allThemes.map((t) => t.pack) as readonly string[]).length > 0
        ? (allThemes.map((t) => t.pack) as readonly string[])
        : (['minimal'] as const),
      'minimal',
    )

    // Default selection: events-bus + auth-core + auth-jwt always; plus payment-fake
    // if available. Operator can flip from there.
    const defaultSelection = liveModules
      .filter((m) =>
        ['events-bus', 'auth-core', 'auth-jwt', 'payment-fake'].includes(m.id),
      )
      .map((m) => m.id)
    const moduleIds = await askMulti(
      'Modules to include',
      liveModules.map((m) => ({
        id: m.id,
        label: m.manifest.displayName ?? m.id,
      })),
      defaultSelection,
    )

    const recipe = {
      schemaVersion: '1.0.0',
      id,
      createdAt: new Date().toISOString(),
      archetype,
      ...(vertical ? { vertical } : {}),
      stack: { backend, frontend, database },
      modules: moduleIds.map((mid) => {
        const m = liveModules.find((x) => x.id === mid)
        return {
          id: mid,
          version: m?.manifest.version ?? '1.0.0',
          config: {},
        }
      }),
      integrations: {},
      auth: { methods: ['email-password'] },
      theme: { pack: themeId },
      branding: { name },
    }

    const recipesDir = path.join(repoRoot, 'recipes')
    const outPath = parsed.outPath ?? path.join(recipesDir, `${id}.json`)
    await mkdir(path.dirname(outPath), { recursive: true })
    await writeFile(outPath, JSON.stringify(recipe, null, 2) + '\n', 'utf-8')

    process.stdout.write(
      '\n' +
        kleur.green(`✓ Recipe written: ${outPath}\n`) +
        kleur.dim(`  modules (${moduleIds.length}): ${moduleIds.join(', ')}\n`) +
        kleur.dim(`  next: b-dash generate ${path.relative(repoRoot, outPath)}\n`),
    )
    return 0
  } finally {
    rl.close()
  }
}
