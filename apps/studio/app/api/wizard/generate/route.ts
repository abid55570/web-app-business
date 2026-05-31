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
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

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
  const existingIds = new Set(baseMods.map((m) => m.id))
  const toAdd: ModEntry[] = []
  for (const id of extraModules(body)) {
    if (!existingIds.has(id)) toAdd.push({ id, version: '1.0.0', config: {} })
  }
  const merged = [...baseMods, ...toAdd]
  recipe.modules = merged

  // Apply brand overrides.
  recipe.id = `wizard-${Date.now()}`
  if (!recipe.branding || typeof recipe.branding !== 'object') recipe.branding = {}
  ;(recipe.branding as Record<string, string>).name = body.appName || 'My App'
  ;(recipe.branding as Record<string, string>).tagline = body.tagline || ''
  ;(recipe.branding as Record<string, string>).primary = body.brandColor || '#6366f1'

  if (body.deployTarget && body.deployTarget !== 'none') {
    recipe.deployTarget = body.deployTarget
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
