/**
 * `b-dash list <what>`
 *
 * Supports: contracts | starters | themes | sections | modules
 *
 * Walks upward from CWD looking for the named directory (mirrors how a
 * generator command would resolve workspace roots). Output is sorted +
 * filterable by a future --json flag.
 */
import { readdir, stat, readFile } from 'node:fs/promises'
import path from 'node:path'
import kleur from 'kleur'

const SUBJECTS = ['contracts', 'starters', 'themes', 'sections', 'modules'] as const
type Subject = (typeof SUBJECTS)[number]

async function findDir(start: string, name: string): Promise<string | null> {
  let dir = start
  const root = path.parse(dir).root
  while (dir !== root) {
    const candidate = path.join(dir, name)
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


async function isDir(p: string): Promise<boolean> {
  try {
    return (await stat(p)).isDirectory()
  } catch {
    return false
  }
}


async function listContracts(dir: string): Promise<number> {
  const entries = await readdir(dir)
  const contracts = entries.filter((f) => f.endsWith('.contract.yaml')).sort()
  if (contracts.length === 0) {
    process.stdout.write(kleur.dim('(no contracts found)\n'))
    return 0
  }
  process.stdout.write(kleur.bold(`Contracts in ${dir}:\n`))
  for (const c of contracts) {
    process.stdout.write(`  ${kleur.cyan(c)}\n`)
  }
  return 0
}


async function listStarters(dir: string): Promise<number> {
  const entries = await readdir(dir)
  const found: Array<{
    name: string
    archetype?: string
    vertical?: string
    theme?: string
    moduleCount?: number
  }> = []
  for (const name of entries.sort()) {
    const recipePath = path.join(dir, name, 'recipe.json')
    try {
      const raw = await readFile(recipePath, 'utf8')
      const json = JSON.parse(raw)
      found.push({
        name,
        archetype: json.archetype,
        vertical: json.vertical,
        theme: json.theme?.pack,
        moduleCount: Array.isArray(json.modules) ? json.modules.length : undefined,
      })
    } catch {
      // skip non-starter dirs
    }
  }
  if (found.length === 0) {
    process.stdout.write(kleur.dim('(no starters found)\n'))
    return 0
  }
  process.stdout.write(kleur.bold(`Starters in ${dir}:\n`))
  for (const s of found) {
    const meta = [
      s.archetype,
      s.vertical && s.vertical !== s.archetype ? s.vertical : null,
      s.theme ? `theme=${s.theme}` : null,
      s.moduleCount != null ? `${s.moduleCount} modules` : null,
    ]
      .filter(Boolean)
      .join(' · ')
    process.stdout.write(`  ${kleur.cyan(s.name)}${kleur.dim(`  (${meta})`)}\n`)
  }
  return 0
}


async function listThemes(dir: string): Promise<number> {
  const entries = await readdir(dir)
  const themes: Array<{ name: string; displayName?: string }> = []
  for (const name of entries.sort()) {
    if (!(await isDir(path.join(dir, name)))) continue
    let displayName: string | undefined
    try {
      const raw = await readFile(path.join(dir, name, 'theme.yaml'), 'utf8')
      const m = raw.match(/^displayName:\s*"?([^"\n]+)"?/m)
      if (m) displayName = m[1].trim()
    } catch {
      continue
    }
    themes.push({ name, displayName })
  }
  if (themes.length === 0) {
    process.stdout.write(kleur.dim('(no themes found)\n'))
    return 0
  }
  process.stdout.write(kleur.bold(`Themes in ${dir}:\n`))
  for (const t of themes) {
    process.stdout.write(
      `  ${kleur.cyan(t.name)}${t.displayName ? kleur.dim(`  — ${t.displayName}`) : ''}\n`,
    )
  }
  return 0
}


async function listSections(dir: string): Promise<number> {
  const cats = (await readdir(dir)).sort()
  const rows: Array<{ category: string; id: string }> = []
  for (const cat of cats) {
    const catPath = path.join(dir, cat)
    if (!(await isDir(catPath))) continue
    for (const s of (await readdir(catPath)).sort()) {
      if (await isDir(path.join(catPath, s))) {
        rows.push({ category: cat, id: s })
      }
    }
  }
  if (rows.length === 0) {
    process.stdout.write(kleur.dim('(no sections found)\n'))
    return 0
  }
  process.stdout.write(kleur.bold(`Sections in ${dir} (${rows.length}):\n`))
  let last = ''
  for (const r of rows) {
    if (r.category !== last) {
      process.stdout.write(`  ${kleur.yellow(r.category)}/\n`)
      last = r.category
    }
    process.stdout.write(`    ${kleur.cyan(r.id)}\n`)
  }
  return 0
}


async function listModules(dir: string): Promise<number> {
  const entries = (await readdir(dir)).sort()
  const found: string[] = []
  for (const name of entries) {
    if (await isDir(path.join(dir, name))) found.push(name)
  }
  if (found.length === 0) {
    process.stdout.write(kleur.dim('(no modules found)\n'))
    return 0
  }
  process.stdout.write(kleur.bold(`Modules in ${dir} (${found.length}):\n`))
  for (const m of found) {
    process.stdout.write(`  ${kleur.cyan(m)}\n`)
  }
  return 0
}


export async function runList(args: string[]): Promise<number> {
  const what = args[0] as Subject | undefined
  if (!what) {
    process.stderr.write(
      kleur.red(`Usage: b-dash list <${SUBJECTS.join(' | ')}>\n`),
    )
    return 2
  }

  if (!SUBJECTS.includes(what)) {
    process.stderr.write(
      kleur.red(
        `Unknown subject '${what}'. Expected one of: ${SUBJECTS.join(', ')}.\n`,
      ),
    )
    return 2
  }

  const dir = await findDir(process.cwd(), what)
  if (!dir) {
    process.stderr.write(
      kleur.red(`No ${what}/ directory found in the current workspace.\n`),
    )
    return 1
  }

  switch (what) {
    case 'contracts':
      return listContracts(dir)
    case 'starters':
      return listStarters(dir)
    case 'themes':
      return listThemes(dir)
    case 'sections':
      return listSections(dir)
    case 'modules':
      return listModules(dir)
  }
}
