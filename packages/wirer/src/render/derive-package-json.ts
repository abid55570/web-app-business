/**
 * Derive `<output>/frontend/package.json` by merging the scaffold's base
 * package.json with each module's `dependencies.frontend` /
 * `dependencies.frontendDev` entries.
 *
 * Conflict policy: when two modules declare the same dep, the later one wins
 * and we log a warning so the operator can pin in the recipe if needed. The
 * scaffold's own dependencies are baseline — modules can override (e.g. force
 * a newer next).
 */
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { WirePlan } from '../types.js'

export type DerivePackageJsonArgs = {
  plan: WirePlan
  outputDir: string
}

type PkgJson = {
  name?: string
  version?: string
  private?: boolean
  scripts?: Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  [key: string]: unknown
}

export async function derivePackageJson(
  args: DerivePackageJsonArgs,
): Promise<string | null> {
  const dest = path.join(args.outputDir, 'frontend', 'package.json')

  // No frontend? Nothing to do.
  let base: PkgJson
  try {
    base = JSON.parse(await readFile(dest, 'utf-8'))
  } catch {
    return null
  }

  const deps: Record<string, string> = { ...(base.dependencies ?? {}) }
  const devDeps: Record<string, string> = { ...(base.devDependencies ?? {}) }

  for (const m of args.plan.resolvedRecipe.modules) {
    const md = m.manifest.dependencies
    if (!md) continue
    for (const [name, ver] of Object.entries(md.frontend ?? {})) {
      mergeDep(deps, name, ver, m.id, 'frontend')
    }
    for (const [name, ver] of Object.entries(md.frontendDev ?? {})) {
      mergeDep(devDeps, name, ver, m.id, 'frontendDev')
    }
  }

  const merged: PkgJson = {
    ...base,
    name: appPkgName(args.plan.resolvedRecipe.recipe.id),
    dependencies: sortRecord(deps),
    devDependencies: sortRecord(devDeps),
  }

  await writeFile(dest, JSON.stringify(merged, null, 2) + '\n', 'utf-8')
  return dest
}

function mergeDep(
  acc: Record<string, string>,
  name: string,
  version: string,
  moduleId: string,
  area: string,
): void {
  if (acc[name] && acc[name] !== version) {
    // eslint-disable-next-line no-console
    console.warn(
      `[wirer] package.json [${area}]: ${moduleId} requests ${name}@${version} but ${acc[name]} already set; using ${version}`,
    )
  }
  acc[name] = version
}

function sortRecord(rec: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const k of Object.keys(rec).sort()) out[k] = rec[k]
  return out
}

function appPkgName(recipeId: string): string {
  // npm package name rules: lowercase, no spaces, hyphens ok.
  return recipeId
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '')
}
