/**
 * List all generated wizard apps under <repo>/output/wizard-*.
 * Each row: { id, outDir, recipe { id, branding, modules, sections }, mtimeMs }.
 */
import { NextResponse } from 'next/server'
import { readFile, readdir, stat } from 'node:fs/promises'
import { resolve } from 'node:path'

const PROJECT_ROOT = resolve(process.cwd(), '..', '..')
const OUTPUT_DIR = resolve(PROJECT_ROOT, 'output')

export async function GET() {
  let entries
  try {
    entries = await readdir(OUTPUT_DIR, { withFileTypes: true })
  } catch {
    return NextResponse.json({ apps: [] })
  }

  const wizardDirs = entries
    .filter((e) => e.isDirectory() && e.name.startsWith('wizard-'))
    .map((e) => e.name)

  const apps = await Promise.all(
    wizardDirs.map(async (id) => {
      const outDir = resolve(OUTPUT_DIR, id)
      const recipePath = resolve(outDir, 'recipe.json')
      try {
        const [raw, st] = await Promise.all([
          readFile(recipePath, 'utf-8'),
          stat(recipePath),
        ])
        const recipe = JSON.parse(raw)
        return {
          id,
          outDir,
          mtimeMs: st.mtimeMs,
          recipe: {
            id: recipe.id,
            branding: recipe.branding ?? {},
            modules: (recipe.modules ?? []).map((m: { id: string }) => m.id),
            sections: recipe.sections ?? [],
            stack: recipe.stack ?? {},
          },
        }
      } catch {
        return null
      }
    }),
  )

  const valid = apps
    .filter((a): a is NonNullable<typeof a> => !!a)
    .sort((a, b) => b.mtimeMs - a.mtimeMs)

  return NextResponse.json({ apps: valid, count: valid.length })
}
