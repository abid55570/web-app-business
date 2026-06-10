/**
 * Sprint 18 — visual schema editor backing API.
 *
 *   GET  /api/wizard/apps/<id>/schema
 *     → parses prisma/schema.prisma + returns models with fields.
 *
 *   POST /api/wizard/apps/<id>/schema
 *     body: { action: 'add-field', model: 'Post', field: { name, type, optional?, unique? } }
 *     body: { action: 'add-model', model: { name, fields: [...] } }
 *     → mutates prisma/schema.prisma + spawns wirer regen so derived
 *       migrations + CRUD endpoints get rebuilt for the new shape.
 *
 * For Sprint 18 V1, supported field types: String, Int, Float, Boolean,
 * DateTime. Relations + arrays defer to a later sprint.
 */
import { NextResponse } from 'next/server'
import { spawn } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const PROJECT_ROOT = resolve(process.cwd(), '..', '..')
const OUTPUT_DIR = resolve(PROJECT_ROOT, 'output')

type Params = { params: Promise<{ id: string }> }
function safeId(id: string): string | null { return /^wizard-[a-z0-9-]+$/i.test(id) ? id : null }

type Field = {
  name: string
  type: string
  optional?: boolean
  unique?: boolean
  defaultValue?: string
  isId?: boolean
  isMap?: string
}
type Model = { name: string; fields: Field[] }

/** Naive Prisma schema parser — covers our generated schemas (modules
 *  contribute models via @@map + @@index, fields are line-based). */
function parseSchema(src: string): Model[] {
  const models: Model[] = []
  // Match `model Name {  ... }`
  const re = /model\s+(\w+)\s*\{([\s\S]*?)\}/g
  let m
  while ((m = re.exec(src)) !== null) {
    const name = m[1]!
    const body = m[2]!
    const fields: Field[] = []
    for (const line of body.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('@@')) continue
      // Match `fieldName  TypeName  modifiers...`
      const fm = /^(\w+)\s+(\w+)(\?)?(\s+.*)?$/.exec(trimmed)
      if (!fm) continue
      const optional = fm[3] === '?'
      const modifiers = fm[4] ?? ''
      fields.push({
        name: fm[1]!,
        type: fm[2]!,
        optional,
        unique: /@unique\b/.test(modifiers),
        isId: /@id\b/.test(modifiers),
        defaultValue: /@default\(([^)]+)\)/.exec(modifiers)?.[1],
      })
    }
    models.push({ name, fields })
  }
  return models
}

const ALLOWED_TYPES = ['String', 'Int', 'Float', 'Boolean', 'DateTime']

function fieldLine(field: Field): string {
  const parts = [field.name, field.type + (field.optional ? '?' : '')]
  const mods: string[] = []
  if (field.isId) mods.push('@id')
  if (field.unique) mods.push('@unique')
  if (field.defaultValue) mods.push(`@default(${field.defaultValue})`)
  if (mods.length > 0) parts.push(mods.join(' '))
  return '  ' + parts.join('  ')
}

export async function GET(_req: Request, ctx: Params) {
  const { id: rawId } = await ctx.params
  const id = safeId(rawId)
  if (!id) return NextResponse.json({ error: 'invalid id' }, { status: 400 })
  const outDir = resolve(OUTPUT_DIR, id)
  const schemaPath = resolve(outDir, 'prisma', 'schema.prisma')
  try {
    const raw = await readFile(schemaPath, 'utf-8')
    return NextResponse.json({ models: parseSchema(raw), allowedTypes: ALLOWED_TYPES, raw })
  } catch (e) {
    return NextResponse.json({ models: [], allowedTypes: ALLOWED_TYPES, error: (e as Error).message }, { status: 404 })
  }
}

export async function POST(req: Request, ctx: Params) {
  const { id: rawId } = await ctx.params
  const id = safeId(rawId)
  if (!id) return NextResponse.json({ error: 'invalid id' }, { status: 400 })
  const outDir = resolve(OUTPUT_DIR, id)
  const schemaPath = resolve(outDir, 'prisma', 'schema.prisma')

  let src: string
  try { src = await readFile(schemaPath, 'utf-8') } catch (e) {
    return NextResponse.json({ error: `cannot read schema: ${(e as Error).message}` }, { status: 404 })
  }

  const body = (await req.json()) as {
    action?: 'add-field' | 'add-model'
    model?: string | { name: string; fields?: Field[] }
    field?: Field
  }

  let next = src
  if (body.action === 'add-field' && typeof body.model === 'string' && body.field) {
    if (!ALLOWED_TYPES.includes(body.field.type)) {
      return NextResponse.json({ error: `type must be one of ${ALLOWED_TYPES.join(', ')}` }, { status: 400 })
    }
    if (!/^[a-zA-Z_]\w*$/.test(body.field.name)) {
      return NextResponse.json({ error: 'field name must be a valid identifier' }, { status: 400 })
    }
    // Find the model + insert the field BEFORE its closing brace.
    const modelRe = new RegExp(`(model\\s+${body.model}\\s*\\{[\\s\\S]*?)(\\n[\\s\\S]*?\\n\\})`, 'm')
    const mm = modelRe.exec(next)
    if (!mm) {
      return NextResponse.json({ error: `model ${body.model} not found` }, { status: 404 })
    }
    // Insert before the index/map block (lines starting with @@).
    const before = mm[1]!
    const after = mm[2]!
    next = next.replace(mm[0], `${before}\n${fieldLine(body.field)}${after}`)
  } else if (body.action === 'add-model' && body.model && typeof body.model === 'object') {
    const name = body.model.name
    if (!/^[A-Z]\w*$/.test(name)) {
      return NextResponse.json({ error: 'model name must be PascalCase' }, { status: 400 })
    }
    const fields = body.model.fields ?? []
    const idField = fields.find((f) => f.isId) ?? { name: 'id', type: 'String', isId: true, defaultValue: 'cuid()' }
    const otherFields = fields.filter((f) => f.name !== idField.name)
    const block = [
      ``,
      `// ===== custom model added via Studio =====`,
      `model ${name} {`,
      fieldLine(idField),
      ...otherFields.map(fieldLine),
      `  createdAt DateTime  @default(now()) @map("created_at")`,
      `  updatedAt DateTime  @updatedAt      @map("updated_at")`,
      ``,
      `  @@map("${name.toLowerCase()}s")`,
      `}`,
      ``,
    ].join('\n')
    next = next + block
  } else {
    return NextResponse.json({ error: 'unsupported action' }, { status: 400 })
  }

  await writeFile(schemaPath, next, 'utf-8')
  // Persist via overrides/ so it survives a full wirer regen
  const rel = 'prisma/schema.prisma'
  const overridePath = resolve(outDir, 'overrides', rel)
  await mkdir(resolve(overridePath, '..'), { recursive: true })
  await writeFile(overridePath, next, 'utf-8')

  // Trigger wirer regen so any backend code that depends on the schema
  // (CRUD endpoints, migrations) gets rebuilt.
  const recipePath = resolve(outDir, 'recipe.json')
  const cli = resolve(PROJECT_ROOT, 'packages', 'cli', 'dist', 'index.js')
  const lines: string[] = []
  const exitCode = await new Promise<number>((res) => {
    const child = spawn('node', [cli, 'generate', recipePath, '--out', outDir], {
      cwd: PROJECT_ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    child.stdout.on('data', (d) => lines.push(String(d).trim()))
    child.stderr.on('data', (d) => lines.push('ERR: ' + String(d).trim()))
    child.on('close', (code) => res(code ?? 1))
  })

  return NextResponse.json({
    ok: exitCode === 0,
    models: parseSchema(next),
    log: lines.slice(-6),
  })
}
