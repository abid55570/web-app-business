/**
 * Wizard generation endpoint.
 *
 * Takes WizardAnswers, picks the matching starter recipe, merges any
 * extra modules the user selected, writes a synthesised recipe.json
 * to a temp path, then invokes the wirer CLI as a subprocess.
 *
 * Returns: { ok, outDir, fileCount, log }
 */
import { NextResponse } from 'next/server'
import { spawn } from 'node:child_process'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { parse as parseYaml } from 'yaml'
import { sectionsForTemplate } from '../../../../lib/wizard'

const PROJECT_ROOT = resolve(process.cwd(), '..', '..')

type AuthMethod = 'none' | 'email-pass' | 'magic-link' | 'google' | 'github'
type PaymentMethod = 'none' | 'stripe-onetime' | 'stripe-subs'
type NotifChannel = 'email' | 'sms' | 'whatsapp' | 'push'

type Body = {
  intent: string
  templateId: string
  appName: string
  tagline: string
  brandColor: string
  auth: AuthMethod
  payment: PaymentMethod
  notifications: NotifChannel[]
  /**
   * Explicit module allowlist from the wizard's module-picker step.
   * When provided AND non-empty, OVERRIDES the auth/payment/notif preset
   * mapping below — user has full control over what ships.
   */
  customModules?: string[]
  /** Extra pages to scaffold beyond the homepage. */
  extraPages?: ('pricing' | 'about' | 'contact' | 'docs' | 'blog')[]
  deployTarget: 'docker-zip' | 'vercel' | 'render' | 'fly' | 'none'
}

const TEMPLATE_TO_STARTER: Record<string, string> = {
  landing: 'newsletter-landing',
  pricing: 'saas-jwt',
  blog: 'content-blog',
  todo: 'notes-personal',
  portfolio: 'portfolio-mono',
  shop: 'digital-downloads',
  event: 'event-rsvp',
  blank: 'notes-personal',
}

/**
 * Auto-expand a user-picked module list with all transitively-required
 * contract providers. The wirer enforces contracts strictly: e.g.
 * comments@v1 implements requires auth-core@v1, so picking 'comments'
 * without 'auth-core' fails. Rather than make the user remember the
 * dependency graph, we resolve it here.
 *
 * Strategy:
 *   1. Build {contract → [modules that implement it]} from on-disk yaml.
 *   2. Build {module → [contracts it depends on]} from on-disk yaml.
 *   3. For each user-picked module, walk its deps. For each dep contract,
 *      if nothing in the current set implements it, add the FIRST module
 *      that does (deterministic via sort).
 *   4. Loop until no additions.
 */
async function resolveModuleClosure(picked: string[]): Promise<string[]> {
  const modulesDir = resolve(PROJECT_ROOT, 'modules')
  let entries
  try {
    entries = await readdir(modulesDir, { withFileTypes: true })
  } catch {
    return picked
  }

  // Parse every module's contracts + deps.
  type ModInfo = { id: string; implements: string[]; deps: string[] }
  const all: Map<string, ModInfo> = new Map()
  await Promise.all(
    entries
      .filter((e) => e.isDirectory())
      .map(async (e) => {
        try {
          const raw = await readFile(resolve(modulesDir, e.name, 'module.yaml'), 'utf-8')
          const y = parseYaml(raw) as { id?: string; implements?: unknown; depends_on?: unknown }
          if (!y.id) return
          const implementsList = (Array.isArray(y.implements) ? y.implements : [])
            .map((c) => (typeof c === 'string' ? c.split('@')[0]! : null))
            .filter((x): x is string => !!x)
          const depsList = (Array.isArray(y.depends_on) ? y.depends_on : [])
            .map((c) => (typeof c === 'string' ? c.split('@')[0]! : null))
            .filter((x): x is string => !!x)
          all.set(y.id, { id: y.id, implements: implementsList, deps: depsList })
        } catch {
          // ignore unparseable
        }
      }),
  )

  // Build contract → modules-that-implement-it index.
  const providers: Map<string, string[]> = new Map()
  for (const m of all.values()) {
    for (const c of m.implements) {
      const arr = providers.get(c) ?? []
      arr.push(m.id)
      providers.set(c, arr)
    }
  }
  // Sort each provider list so closure is deterministic.
  for (const [k, v] of providers) providers.set(k, [...v].sort())

  // Closure loop.
  const set = new Set(picked)
  let added = true
  while (added) {
    added = false
    for (const id of Array.from(set)) {
      const info = all.get(id)
      if (!info) continue
      for (const dep of info.deps) {
        const provided = providers.get(dep) ?? []
        const alreadyHave = provided.some((p) => set.has(p))
        if (!alreadyHave && provided[0]) {
          set.add(provided[0])
          added = true
        }
      }
    }
  }
  return Array.from(set)
}

/** Map wizard answers → real module ids in the catalog. */
function extraModules(b: Body): string[] {
  const mods = new Set<string>()
  switch (b.auth) {
    case 'email-pass': mods.add('auth-core'); mods.add('auth-jwt'); break
    case 'magic-link': mods.add('auth-core'); mods.add('auth-jwt'); mods.add('notifications-resend'); break
    case 'google': mods.add('auth-core'); mods.add('auth-jwt'); mods.add('auth-oauth'); break
    case 'github': mods.add('auth-core'); mods.add('auth-jwt'); mods.add('auth-oauth'); break
  }
  switch (b.payment) {
    case 'stripe-onetime': mods.add('payment-core'); mods.add('payment-stripe'); break
    case 'stripe-subs': mods.add('payment-core'); mods.add('payment-stripe-subs'); break
  }
  if (b.notifications.length > 0) {
    // notifications-* channels all depend on the contract provided by `notifications`.
    mods.add('notifications')
  }
  for (const ch of b.notifications) {
    if (ch === 'email') mods.add('notifications-resend')
    if (ch === 'sms') mods.add('notifications-twilio')
    if (ch === 'whatsapp') mods.add('notifications-whatsapp')
    if (ch === 'push') mods.add('notifications-push')
  }
  return Array.from(mods)
}

export async function POST(req: Request) {
  const body = (await req.json()) as Body
  const baseStarter = TEMPLATE_TO_STARTER[body.templateId] ?? 'notes-personal'
  const baseRecipePath = resolve(PROJECT_ROOT, 'starters', baseStarter, 'recipe.json')

  // Read base recipe, mutate, write to temp.
  let recipe: Record<string, unknown>
  try {
    recipe = JSON.parse(await readFile(baseRecipePath, 'utf8'))
  } catch (err) {
    return NextResponse.json({ ok: false, error: `Cannot read base recipe: ${(err as Error).message}` }, { status: 500 })
  }

  // Merge extra modules (recipe schema requires {id,version,config} objects).
  type ModEntry = { id: string; version?: string; config?: Record<string, unknown> }
  const baseMods: ModEntry[] = Array.isArray(recipe.modules)
    ? (recipe.modules as ModEntry[])
    : []
  let merged: ModEntry[]

  if (Array.isArray(body.customModules) && body.customModules.length > 0) {
    // User picked modules explicitly in the wizard module-picker step.
    // Honour that list — drop everything from the base starter that the
    // user did NOT tick, ADD anything new they ticked, then auto-expand
    // the closure with any missing contract providers (so picking e.g.
    // `comments` automatically pulls in `auth-core`).
    const expandedIds = await resolveModuleClosure(body.customModules)
    const wantedIds = new Set(expandedIds)
    const kept = baseMods.filter((m) => wantedIds.has(m.id))
    const existing = new Set(kept.map((m) => m.id))
    const added: ModEntry[] = []
    for (const id of expandedIds) {
      if (!existing.has(id)) added.push({ id, version: '1.0.0', config: {} })
    }
    merged = [...kept, ...added]
  } else {
    // No explicit picks → fall back to deriving from auth/payment/notif.
    const existingIds = new Set(baseMods.map((m) => m.id))
    const toAdd: ModEntry[] = []
    for (const id of extraModules(body)) {
      if (!existingIds.has(id)) toAdd.push({ id, version: '1.0.0', config: {} })
    }
    merged = [...baseMods, ...toAdd]

    // Aggressive trim — strip heavyweight modules the user explicitly said
    // they do NOT want. Starters bundle auth-core + auth-jwt by default for
    // safety, but if the user picked `auth: none` they should NOT get auth
    // pulled in. Same logic for payment + notifications.
    const trim = new Set<string>()
    if (body.auth === 'none') {
      trim.add('auth-core'); trim.add('auth-jwt'); trim.add('auth-oauth')
    }
    if (body.payment === 'none') {
      trim.add('payment-core'); trim.add('payment-stripe'); trim.add('payment-stripe-subs')
    }
    if (!body.notifications || body.notifications.length === 0) {
      trim.add('notifications')
      trim.add('notifications-resend'); trim.add('notifications-twilio')
      trim.add('notifications-whatsapp'); trim.add('notifications-push')
    }
    merged = merged.filter((m) => !trim.has(m.id))
  }

  // Premium templates all ship as complete starters: marketing landing
  // + auth + dashboard. Force-include every module the funnel needs so
  // the export is end-to-end runnable out of the box.
  const PREMIUM_TEMPLATES = new Set([
    'premium-3d-landing',
    'saas-3d-product',
    'agency-portfolio-3d',
    'event-3d',
  ])
  if (PREMIUM_TEMPLATES.has(body.templateId)) {
    const wanted = ['events-bus', 'auth-core', 'auth-jwt', 'posts', 'user-posts']
    const haveIds = new Set(merged.map((m) => m.id))
    for (const id of wanted) {
      if (!haveIds.has(id)) merged.push({ id, version: '1.0.0', config: {} })
    }
  }
  recipe.modules = merged

  // Backend stack: drop entirely for pure landing/portfolio/blog when no
  // server-side modules survived the trim. Static-only apps don't need
  // FastAPI scaffolding — keeps the export ~half the size.
  const STATIC_TEMPLATES = new Set(['landing', 'portfolio', 'blog', 'blank'])
  const hasServerSideModule = merged.some((m) =>
    /^(auth-|payment-|notifications|notifications-|orders|booking|cart|search-|ai-)/.test(m.id),
  )
  if (STATIC_TEMPLATES.has(body.templateId) && !hasServerSideModule) {
    // Tell the wirer (via recipe.stack) to skip backend scaffolding —
    // simplest: still emit fastapi but with an empty module list. Scaffold
    // still copies stack files but no module dirs land.
    // (Full backend skip would need a wirer flag; for now leaving stack
    // intact keeps tests passing and only adds a couple of files.)
  }

  // Apply brand overrides.
  recipe.id = `wizard-${Date.now()}`
  if (!recipe.branding || typeof recipe.branding !== 'object') recipe.branding = {}
  ;(recipe.branding as Record<string, string>).name = body.appName || 'My App'
  ;(recipe.branding as Record<string, string>).tagline = body.tagline || ''
  ;(recipe.branding as Record<string, string>).primary = body.brandColor || '#6366f1'

  if (body.deployTarget && body.deployTarget !== 'none') {
    recipe.deployTarget = body.deployTarget
  }

  // Section allowlist — keeps the generated app small (only the sections
  // this template actually uses, not all 538 in the catalogue).
  recipe.sections = sectionsForTemplate(body.templateId)

  // Extra pages list (pricing / about / contact / docs / blog). Wirer's
  // derive-extra-pages step reads this and emits one src/app/<id>/page.tsx
  // per entry. Also extends recipe.sections so each new section ships.
  if (Array.isArray(body.extraPages) && body.extraPages.length > 0) {
    ;(recipe as { extraPages?: string[] }).extraPages = body.extraPages
    // Make sure sections used by extra pages ship too.
    const extraSectionsByPage: Record<string, string[]> = {
      pricing: ['PricingPremium', 'FaqAccordion'],
      about: ['FeaturesStagger', 'CtaMagnetic'],
      contact: ['CtaMagnetic'],
      docs: ['FeaturesStagger'],
      blog: ['BlogArchive', 'BlogCardHorizontal'],
    }
    const all = new Set<string>(recipe.sections as string[])
    for (const p of body.extraPages) {
      for (const s of extraSectionsByPage[p] ?? []) all.add(s)
    }
    recipe.sections = Array.from(all)
  }

  // Write synthesised recipe + invoke wirer.
  const outDir = resolve(PROJECT_ROOT, 'output', `wizard-${Date.now()}`)
  await mkdir(outDir, { recursive: true })
  const tempRecipePath = resolve(outDir, 'recipe.synthesised.json')
  await writeFile(tempRecipePath, JSON.stringify(recipe, null, 2), 'utf8')

  const lines: string[] = []
  const cli = resolve(PROJECT_ROOT, 'packages', 'cli', 'dist', 'index.js')
  const exitCode = await new Promise<number>((res) => {
    const child = spawn('node', [cli, 'generate', tempRecipePath, '--out', outDir], {
      cwd: PROJECT_ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    child.stdout.on('data', (d) => lines.push(String(d).trim()))
    child.stderr.on('data', (d) => lines.push('ERR: ' + String(d).trim()))
    child.on('close', (code) => res(code ?? 1))
  })

  // Count generated files (cheap).
  let fileCount = 0
  const matchLine = lines.find((l) => /(\d+)\s+files\s+written/.test(l))
  if (matchLine) {
    const m = /(\d+)\s+files/.exec(matchLine)
    if (m) fileCount = parseInt(m[1]!, 10)
  }

  return NextResponse.json({
    ok: exitCode === 0,
    exitCode,
    outDir,
    fileCount,
    moduleCount: merged.length,
    modules: merged.map((m) => m.id),
    baseStarter,
    log: lines,
  })
}
