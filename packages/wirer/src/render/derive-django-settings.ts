/**
 * Append per-module Django settings to `<output>/backend/config/settings.py`.
 *
 * Every module in the recipe contributes its dotted-path to
 * ``INSTALLED_APPS`` — derive-django-models stubs an ``apps.py`` for any
 * module that didn't author one, so the registration is always safe even
 * for behaviour-only modules (e.g. events-bus contributes nothing but a
 * placeholder app config).
 *
 * If the recipe includes auth-core, we also pin ``AUTH_USER_MODEL`` so
 * Django picks up our custom User instead of django.contrib.auth's default.
 *
 * The scaffold's settings.py is otherwise left intact — overrides land here
 * via a fence comment so re-derivation stays idempotent.
 */
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { WirePlan } from '../types.js'
import { pythonPkgName } from './copy-module.js'

const FENCE_BEGIN = '# === b-dash derived (do not edit) ==='
const FENCE_END = '# === /b-dash derived ==='

export async function deriveDjangoSettings(args: {
  plan: WirePlan
  modulesRoot: string
  outputDir: string
}): Promise<string | null> {
  const dest = path.join(args.outputDir, 'backend', 'config', 'settings.py')
  let original: string
  try {
    original = await readFile(dest, 'utf-8')
  } catch {
    return null // not a Django scaffold
  }

  // We unused-arg modulesRoot intentionally — derive-django-models has
  // already stubbed apps.py for every module dir, so we register all of
  // them unconditionally rather than re-checking the source tree.
  void args.modulesRoot

  // Walk modules in RECIPE INSERTION ORDER (not topo-sorted) so the
  // operator's module sequence drives Django's INSTALLED_APPS order →
  // AppConfig.ready() execution order → "last installer wins" on shared
  // registries (payment-core gateways, notifications channel adapters).
  const byId = new Map(
    args.plan.resolvedRecipe.modules.map((m) => [m.id, m]),
  )
  const installedApps: string[] = []
  let hasAuthCore = false
  for (const recipeMod of args.plan.resolvedRecipe.recipe.modules) {
    const m = byId.get(recipeMod.id)
    if (!m) continue
    const pkg = pythonPkgName(m.id)
    installedApps.push(`    "${pkg}",`)
    if (m.id === 'auth-core') hasAuthCore = true
  }

  const block = [
    FENCE_BEGIN,
    'INSTALLED_APPS = INSTALLED_APPS + [',
    ...installedApps,
    ']',
    hasAuthCore ? 'AUTH_USER_MODEL = "auth_core.User"' : '',
    FENCE_END,
    '',
  ]
    .filter(Boolean)
    .join('\n')

  // Strip any prior fenced block, then append the new one. APPEND (not
  // prepend) so derived values override the scaffold's defaults — e.g. the
  // scaffold's ``AUTH_USER_MODEL = os.environ.get(...)`` is shadowed by our
  // explicit ``AUTH_USER_MODEL = "auth_core.User"`` here.
  const fenceRe = new RegExp(
    `${escapeRe(FENCE_BEGIN)}[\\s\\S]*?${escapeRe(FENCE_END)}\\n?`,
    'g',
  )
  const cleaned = original.replace(fenceRe, '').replace(/\n+$/, '\n')
  await writeFile(dest, cleaned + '\n' + block + '\n', 'utf-8')
  return dest
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
