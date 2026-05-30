/**
 * Prisma schema parser + Django/SQLAlchemy model emitters.
 *
 * Scope:
 *  - `model X { ... }` blocks (field lines + @@map / @@index / @@unique)
 *  - Foreign key relations: `customer User @relation(fields: [customerId], references: [id], onDelete: Cascade)`
 *    The relation field itself is skipped from the emitted columns; the
 *    scalar field (`customerId`) it points at gains a ForeignKey constraint
 *    referencing the target model's table+column.
 *
 * Out of scope (Phase 4+): enums, datasource/generator blocks, many-to-many
 * implicit join tables, polymorphic relations, ORM relationship() helpers.
 *
 * Field name conversion: Prisma uses camelCase, Django/SQLAlchemy lean
 * snake_case. We snake-case the Python attribute name and capture the
 * original camelCase as a `db_column` when no explicit `@map` overrides it.
 */
import { readFile } from 'node:fs/promises'

// ──────────────────────────── parsing ────────────────────────────

export type FieldDef = {
  name: string
  type: string // "String" | "Int" | "Decimal" | ...
  isList: boolean
  isOptional: boolean
  attrs: FieldAttr[]
  /** Set by the parser's post-process pass when this scalar field is the
   * FK column for a relation (`customer User @relation(fields: [customerId])`). */
  fk?: {
    targetModel: string
    targetColumn: string
    onDelete: string
    optional: boolean
    /** Name of the forward virtual accessor in Prisma (`customer`). Used
     * by SA emitter to wire `relationship(back_populates="customer")`. */
    forwardFieldName?: string
    /** Name of the reverse list field on the target model (`orders`). Used
     * by Django emitter as `related_name`, by SA emitter as the back-side
     * back_populates target. Set only when the parser pairs forward+reverse
     * within the same file. */
    reverseFieldName?: string
  }
}

/** A virtual ORM accessor — Prisma's relation/reverse field that translates
 * to a `relationship(...)` helper in SA or a `related_name` in Django.
 * Carried on the model so emitters can render the back-side accessor on
 * the parent (e.g. ``User.orders``). */
export type RelationAccessor = {
  /** Field name on the model (`orders`). */
  name: string
  /** Target model (`Order`). */
  targetModel: string
  /** Whether this side is a list (1:N). False for the FK side. */
  isList: boolean
  /** Name of the matching field on the other side (back_populates target). */
  inverseFieldName: string
}

export type FieldAttr = {
  name: string // "id" | "default" | "unique" | "map" | "db.Decimal" | "updatedAt"
  args: string[] // raw arg tokens
}

export type ModelDef = {
  name: string
  fields: FieldDef[]
  blockAttrs: BlockAttr[]
  /** Virtual ORM accessors emitted as `relationship(...)` (SA) or
   * `related_name` (Django). Populated by the parser's reverse-pairing
   * post-process pass (within-file) + pairAcrossFiles (cross-file). */
  relations: RelationAccessor[]
  /** Forwards declared on this model that didn't find a within-file
   * reverse match. Cross-file pairer reads these. */
  _unpairedForwards?: UnpairedForward[]
  /** Reverse list fields declared on this model that didn't find a
   * within-file forward match. Cross-file pairer reads these. */
  _unpairedReverses?: UnpairedReverse[]
}

export type UnpairedForward = {
  fieldName: string
  targetModel: string
  /** Reference to the scalar field carrying the FK metadata so the cross
   * -file pairer can attach reverseFieldName once a match shows up. */
  fkScalar: FieldDef | null
}

export type UnpairedReverse = {
  fieldName: string
  targetModel: string
}

export type BlockAttr = {
  name: string // "map" | "index" | "unique"
  args: string[]
}

const MODEL_RE = /\bmodel\s+([A-Z][\w]*)\s*\{([\s\S]*?)\}/g

export function parsePrismaSchema(source: string): ModelDef[] {
  const cleaned = stripComments(source)
  const models: ModelDef[] = []
  let m: RegExpExecArray | null
  while ((m = MODEL_RE.exec(cleaned))) {
    models.push(parseModel(m[1], m[2]))
  }
  // Post-process pass — three jobs:
  //   1. Identify forward relation fields (`customer User @relation(...)`)
  //      and attach an fk annotation to the scalar they reference. Drop
  //      the virtual relation field from columns; remember its name so
  //      we can set up back_populates / related_name later.
  //   2. Identify reverse list fields (`orders Order[]` with no
  //      @relation(fields:) — Prisma's implicit reverse). Drop them too;
  //      remember (parentModel, fieldName, targetModel) for matching.
  //   3. Pair forwards with reverses across all parsed models. When a
  //      pair matches, fill in fk.reverseFieldName / fk.forwardFieldName
  //      and emit a RelationAccessor on each side.
  //
  // Cross-file relations (parser sees only one file at a time): forward
  // FK still works via the registry; reverse pairing only fires when the
  // target model is in the same file. That's the common case; cross-file
  // reverse helpers can be added in a future pass.

  // Job 1 + 2: collect forwards + reverses per model.
  type Forward = {
    parentModel: string
    fieldName: string
    targetModel: string
    fkScalar: FieldDef | null
  }
  type Reverse = {
    parentModel: string
    fieldName: string
    targetModel: string
    isList: boolean
  }
  const forwards: Forward[] = []
  const reverses: Reverse[] = []

  for (const model of models) {
    if (!model.relations) model.relations = []
    const surviving: FieldDef[] = []
    for (const field of model.fields) {
      const rel = field.attrs.find((a) => a.name === 'relation')
      const isModelTyped = !isScalarType(field.type)

      if (rel !== undefined && isModelTyped) {
        // Forward relation — has @relation(fields: [...], references: [...])
        const fieldsArg = rel.args.find((a) => a.startsWith('fields:'))
        const refsArg = rel.args.find((a) => a.startsWith('references:'))
        const onDeleteArg = rel.args.find((a) => a.startsWith('onDelete:'))
        const scalarName = parseListArg(fieldsArg)?.[0]
        const refColumn = parseListArg(refsArg)?.[0] ?? 'id'
        const onDelete = (onDeleteArg ?? '').split(':')[1]?.trim()
        let scalarRef: FieldDef | null = null
        if (scalarName) {
          const scalar = model.fields.find((f) => f.name === scalarName)
          if (scalar) {
            scalar.fk = {
              targetModel: field.type,
              targetColumn: refColumn,
              onDelete: onDelete || 'NoAction',
              optional: field.isOptional,
              forwardFieldName: field.name,
            }
            scalarRef = scalar
          }
        }
        forwards.push({
          parentModel: model.name,
          fieldName: field.name,
          targetModel: field.type,
          fkScalar: scalarRef,
        })
        continue // drop the virtual forward field
      }

      if (rel === undefined && isModelTyped && field.isList) {
        // Implicit reverse — list of model-typed values, no @relation.
        reverses.push({
          parentModel: model.name,
          fieldName: field.name,
          targetModel: field.type,
          isList: true,
        })
        continue // drop the virtual reverse field
      }

      surviving.push(field)
    }
    model.fields = surviving
  }

  // Job 3: pair forwards with reverses + emit RelationAccessor on each side.
  // A pair matches when:  fwd.targetModel == rev.parentModel
  //                  AND  fwd.parentModel == rev.targetModel
  // Anything left unpaired drops onto model._unpairedForwards/_Reverses
  // for the cross-file pairer to pick up.
  const pairedFwd = new Set<Forward>()
  const pairedRev = new Set<Reverse>()
  for (const fwd of forwards) {
    const match = reverses.find(
      (r) =>
        r.parentModel === fwd.targetModel &&
        r.targetModel === fwd.parentModel,
    )
    if (!match) continue
    pairedFwd.add(fwd)
    pairedRev.add(match)
    if (fwd.fkScalar?.fk) {
      fwd.fkScalar.fk.reverseFieldName = match.fieldName
    }
    const fwdModel = models.find((m) => m.name === fwd.parentModel)
    const revModel = models.find((m) => m.name === match.parentModel)
    if (fwdModel) {
      fwdModel.relations.push({
        name: fwd.fieldName,
        targetModel: fwd.targetModel,
        isList: false,
        inverseFieldName: match.fieldName,
      })
    }
    if (revModel) {
      revModel.relations.push({
        name: match.fieldName,
        targetModel: match.targetModel,
        isList: true,
        inverseFieldName: fwd.fieldName,
      })
    }
  }

  // Stash unpaired entries for the cross-file pairer.
  for (const fwd of forwards) {
    if (pairedFwd.has(fwd)) continue
    const m = models.find((mm) => mm.name === fwd.parentModel)
    if (!m) continue
    if (!m._unpairedForwards) m._unpairedForwards = []
    m._unpairedForwards.push({
      fieldName: fwd.fieldName,
      targetModel: fwd.targetModel,
      fkScalar: fwd.fkScalar,
    })
  }
  for (const rev of reverses) {
    if (pairedRev.has(rev)) continue
    const m = models.find((mm) => mm.name === rev.parentModel)
    if (!m) continue
    if (!m._unpairedReverses) m._unpairedReverses = []
    m._unpairedReverses.push({
      fieldName: rev.fieldName,
      targetModel: rev.targetModel,
    })
  }

  return models
}


/**
 * Cross-file pairing pass — runs AFTER every module's schema is parsed.
 * Each ModelDef carries `_unpairedForwards`/`_unpairedReverses` from the
 * within-file pass; this function matches them across files and
 * populates `relations` + `fk.reverseFieldName` accordingly.
 *
 * Mutates the input ModelDef[] in place; safe to re-run (idempotent
 * because pairing entries get spliced out of the unpaired arrays).
 */
export function pairAcrossFiles(allModels: ModelDef[]): void {
  const byName = new Map(allModels.map((m) => [m.name, m]))

  for (const fwdModel of allModels) {
    const fwds = fwdModel._unpairedForwards
    if (!fwds || fwds.length === 0) continue

    for (let i = fwds.length - 1; i >= 0; i--) {
      const fwd = fwds[i]
      const targetModel = byName.get(fwd.targetModel)
      if (!targetModel) continue
      const revs = targetModel._unpairedReverses
      if (!revs || revs.length === 0) continue

      const matchIdx = revs.findIndex((r) => r.targetModel === fwdModel.name)
      if (matchIdx === -1) continue
      const rev = revs[matchIdx]

      // Wire both sides.
      if (fwd.fkScalar?.fk) {
        fwd.fkScalar.fk.reverseFieldName = rev.fieldName
      }
      fwdModel.relations.push({
        name: fwd.fieldName,
        targetModel: fwd.targetModel,
        isList: false,
        inverseFieldName: rev.fieldName,
      })
      targetModel.relations.push({
        name: rev.fieldName,
        targetModel: rev.targetModel,
        isList: true,
        inverseFieldName: fwd.fieldName,
      })

      // Splice both out of the unpaired pools.
      revs.splice(matchIdx, 1)
      fwds.splice(i, 1)
    }
  }
}

const SCALAR_TYPES = new Set([
  'String',
  'Int',
  'BigInt',
  'Float',
  'Decimal',
  'Boolean',
  'DateTime',
  'Json',
  'Bytes',
])

function isScalarType(t: string): boolean {
  return SCALAR_TYPES.has(t)
}

/** Parse `fields: [a, b]` or `references: [id]` into the inner list. */
function parseListArg(arg: string | undefined): string[] | null {
  if (!arg) return null
  const m = /\[([^\]]*)\]/.exec(arg)
  if (!m) return null
  return m[1]
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '') // /* */
    .replace(/\/\/[^\n]*/g, '') // //
}

function parseModel(name: string, body: string): ModelDef {
  const fields: FieldDef[] = []
  const blockAttrs: BlockAttr[] = []

  for (const rawLine of body.split('\n')) {
    const line = rawLine.trim()
    if (!line) continue

    if (line.startsWith('@@')) {
      blockAttrs.push(parseBlockAttr(line))
      continue
    }

    const f = parseFieldLine(line)
    if (f) fields.push(f)
  }

  return { name, fields, blockAttrs, relations: [] }
}

function parseFieldLine(line: string): FieldDef | null {
  // <name> <Type>[]?[?] [@attr ...]
  const m = /^([A-Za-z_][\w]*)\s+([A-Z][\w]*)(\[\])?(\?)?(.*)$/.exec(line)
  if (!m) return null
  const [, name, type, listSuffix, optSuffix, rest] = m
  return {
    name,
    type,
    isList: !!listSuffix,
    isOptional: !!optSuffix,
    attrs: parseAttrs(rest),
  }
}

function parseAttrs(rest: string): FieldAttr[] {
  // Tokens like @id, @default(uuid()), @db.Decimal(10, 2), @map("col"), @updatedAt.
  // Hand-rolled because Prisma allows nested parens inside arg lists
  // (e.g. ``@default(uuid())``) which a flat ``[^)]*`` regex can't handle.
  const out: FieldAttr[] = []
  let i = 0
  while (i < rest.length) {
    if (rest[i] !== '@') {
      i++
      continue
    }
    i++ // consume @
    const nameStart = i
    while (i < rest.length && /[\w.]/.test(rest[i])) i++
    const name = rest.slice(nameStart, i)
    let args: string[] = []
    if (rest[i] === '(') {
      i++ // consume (
      const argsStart = i
      let depth = 1
      let inStr: '"' | "'" | null = null
      while (i < rest.length && depth > 0) {
        const ch = rest[i]
        if (inStr) {
          if (ch === inStr) inStr = null
        } else if (ch === '"' || ch === "'") {
          inStr = ch
        } else if (ch === '(') depth++
        else if (ch === ')') depth--
        if (depth > 0) i++
      }
      const argsStr = rest.slice(argsStart, i)
      i++ // consume closing )
      args = argsStr ? splitArgs(argsStr) : []
    }
    out.push({ name, args })
  }
  return out
}

function parseBlockAttr(line: string): BlockAttr {
  // @@map("orders") | @@index([customerId, status]) | @@unique([provider, subject])
  const m = /^@@([\w]+)\(([^)]*)\)/.exec(line)
  if (!m) return { name: 'unknown', args: [] }
  const [, name, argsStr] = m
  return { name, args: splitArgs(argsStr) }
}

/** Tokenize a comma-separated arg list, respecting `[...]` arrays + quotes. */
function splitArgs(s: string): string[] {
  const out: string[] = []
  let depth = 0
  let inStr: '"' | "'" | null = null
  let cur = ''
  for (const ch of s) {
    if (inStr) {
      cur += ch
      if (ch === inStr) inStr = null
      continue
    }
    if (ch === '"' || ch === "'") {
      inStr = ch
      cur += ch
      continue
    }
    if (ch === '[' || ch === '(') depth++
    if (ch === ']' || ch === ')') depth--
    if (ch === ',' && depth === 0) {
      out.push(cur.trim())
      cur = ''
      continue
    }
    cur += ch
  }
  if (cur.trim()) out.push(cur.trim())
  return out
}

// ────────────────────── model registry ──────────────────────────
//
// Cross-file index built by scanning every module's schema.prisma at the
// top of a generate. Lets the FK emitter resolve target table names that
// rely on @@map (e.g., `User` → "users") and target apps for Django's
// "<app_label>.<Model>" string references, instead of guessing via the
// snake-plural fallback.

export type RegistryEntry = {
  tableName: string
  sourceModuleId: string
  /** Snake-cased Python pkg name of the source module (auth-core → auth_core). */
  pythonPkg: string
}

export type ModelRegistry = Map<string, RegistryEntry>


/**
 * Scan parsed schemas across all modules and return a model→entry index.
 * Conflicts (two modules defining the same model name) keep the FIRST
 * entry; subsequent dupes are silently ignored — the wirer's existing
 * conflict detection surfaces them separately.
 */
export function buildModelRegistry(
  perModule: { moduleId: string; pythonPkg: string; models: ModelDef[] }[],
): ModelRegistry {
  const out: ModelRegistry = new Map()
  for (const { moduleId, pythonPkg, models } of perModule) {
    for (const model of models) {
      if (out.has(model.name)) continue
      const mapAttr = model.blockAttrs.find((a) => a.name === 'map')
      const tableName =
        mapAttr?.args[0]?.replace(/^"|"$/g, '') ??
        snakePlural(model.name)
      out.set(model.name, {
        tableName,
        sourceModuleId: moduleId,
        pythonPkg,
      })
    }
  }
  return out
}


function snakePlural(modelName: string): string {
  const snake = modelName.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase()
  return snake.endsWith('s') ? snake : snake + 's'
}


// ─────────────────────────── emitting ────────────────────────────

const TYPE_MAP: Record<string, string> = {
  String: 'CharField',
  Int: 'IntegerField',
  BigInt: 'BigIntegerField',
  Float: 'FloatField',
  Decimal: 'DecimalField',
  Boolean: 'BooleanField',
  DateTime: 'DateTimeField',
  Json: 'JSONField',
  Bytes: 'BinaryField',
}

export function emitDjangoModels(
  models: ModelDef[],
  registry?: ModelRegistry,
): string {
  const usesUuid = models.some((m) =>
    m.fields.some((f) => fieldUsesUuidDefault(f)),
  )
  const usesTimezone = models.some((m) =>
    m.fields.some((f) =>
      f.attrs.some(
        (a) =>
          a.name === 'default' && a.args.some((arg) => arg.includes('now()')),
      ),
    ),
  )

  const header = [
    '"""Django models — generated by b-dash from schema.prisma. DO NOT EDIT."""',
    'from django.db import models',
    usesUuid ? 'import uuid' : '',
    usesTimezone ? 'from django.utils import timezone' : '',
    '',
  ]
    .filter(Boolean)
    .join('\n')

  return (
    header +
    '\n\n' +
    models.map((m) => emitModel(m, registry)).join('\n\n\n') +
    '\n'
  )
}

function fieldUsesUuidDefault(f: FieldDef): boolean {
  return f.attrs.some(
    (a) =>
      a.name === 'default' &&
      a.args.some((arg) => arg === 'uuid()' || arg === 'cuid()'),
  )
}

function emitModel(model: ModelDef, registry?: ModelRegistry): string {
  const fieldLines = model.fields
    .map((f) => emitField(f, registry))
    .filter((s) => s !== null)
    .map((s) => `    ${s}`)
    .join('\n')

  const meta = emitMeta(model)
  const body = [fieldLines, meta].filter(Boolean).join('\n\n')

  return `class ${model.name}(models.Model):\n${body || '    pass'}`
}

function emitField(f: FieldDef, registry?: ModelRegistry): string | null {
  const dj = TYPE_MAP[f.type]
  if (!dj) return `# unsupported type: ${f.name}: ${f.type}`

  const pyName = camelToSnake(f.name)

  // FK promotion — scalar fields tagged by the parser's @relation
  // post-process pass become ForeignKey columns instead of plain
  // CharField/Integer/etc. Registry lookup makes the target a fully
  // qualified ``<app_label>.<Model>`` string when known, so cross-module
  // FKs resolve at Django app load without operator intervention.
  if (f.fk) {
    const onDelete = djangoOnDelete(f.fk.onDelete)
    const target = registry?.get(f.fk.targetModel)
    const targetRef = target
      ? `${target.pythonPkg}.${f.fk.targetModel}`
      : f.fk.targetModel
    // related_name = the reverse field name when the parser paired this
    // forward FK with a reverse list (`orders Order[]` on the parent).
    // Falls back to "+" (suppress back-accessor) when no reverse exists.
    const relatedName = f.fk.reverseFieldName
      ? camelToSnake(f.fk.reverseFieldName)
      : '+'
    const fkKwargs = [
      `to=${JSON.stringify(targetRef)}`,
      `on_delete=models.${onDelete}`,
      `related_name=${JSON.stringify(relatedName)}`,
    ]
    if (f.name !== pyName) {
      fkKwargs.push(`db_column=${JSON.stringify(f.name)}`)
    }
    if (f.fk.optional) {
      fkKwargs.push('null=True', 'blank=True')
    }
    return `${pyName} = models.ForeignKey(${fkKwargs.join(', ')})`
  }

  const kwargs: string[] = []

  // String → max_length default + override via @db.VarChar(N).
  if (dj === 'CharField') {
    const dbVarChar = f.attrs.find((a) => a.name === 'db.VarChar')
    const dbText = f.attrs.find((a) => a.name === 'db.Text')
    if (dbText) {
      // CharField → TextField when @db.Text used.
      return assembleField(pyName, 'TextField', collectStdKwargs(f, []))
    }
    const max = dbVarChar?.args[0] ?? '255'
    kwargs.push(`max_length=${max}`)
  }

  // Decimal → max_digits + decimal_places from @db.Decimal(p, s)
  if (dj === 'DecimalField') {
    const d = f.attrs.find((a) => a.name === 'db.Decimal')
    const [p, s] = d?.args ?? ['12', '2']
    kwargs.push(`max_digits=${p}`)
    kwargs.push(`decimal_places=${s}`)
  }

  // UUID via @default(uuid()) - prefer UUIDField over CharField for Postgres
  if (
    dj === 'CharField' &&
    f.attrs.some(
      (a) =>
        a.name === 'default' &&
        a.args.some((arg) => arg === 'uuid()' || arg === 'cuid()'),
    )
  ) {
    return assembleField(pyName, 'UUIDField', [
      'primary_key=' + (f.attrs.some((a) => a.name === 'id') ? 'True' : 'False'),
      'default=uuid.uuid4',
      'editable=False',
    ])
  }

  return assembleField(pyName, dj, collectStdKwargs(f, kwargs))
}

function collectStdKwargs(f: FieldDef, extra: string[]): string[] {
  const k: string[] = [...extra]

  if (f.attrs.some((a) => a.name === 'id')) k.push('primary_key=True')
  if (f.attrs.some((a) => a.name === 'unique')) k.push('unique=True')

  // Default value handling
  for (const a of f.attrs) {
    if (a.name !== 'default' || a.args.length === 0) continue
    const v = a.args[0]
    if (v === 'now()') {
      k.push('auto_now_add=True')
    } else if (v === 'autoincrement()') {
      // implicit for AutoField; skip
    } else if (v === 'uuid()' || v === 'cuid()') {
      // handled above
    } else if (v === 'true' || v === 'false') {
      k.push(`default=${v === 'true' ? 'True' : 'False'}`)
    } else if (/^-?\d+(\.\d+)?$/.test(v)) {
      k.push(`default=${v}`)
    } else if (/^".*"$/.test(v) || /^'.*'$/.test(v)) {
      k.push(`default=${v.replace(/"/g, "'")}`)
    } else {
      k.push(`default=${v}`)
    }
  }

  if (f.attrs.some((a) => a.name === 'updatedAt')) k.push('auto_now=True')

  // @map -> db_column
  const mapAttr = f.attrs.find((a) => a.name === 'map')
  if (mapAttr) {
    k.push(`db_column=${mapAttr.args[0]}`)
  } else if (f.name !== camelToSnake(f.name)) {
    // Pin db column to original camelCase form so existing schemas
    // round-trip cleanly between SQLAlchemy + Django.
    k.push(`db_column=${JSON.stringify(f.name)}`)
  }

  if (f.isOptional) {
    k.push('null=True')
    k.push('blank=True')
  }

  return k
}

function assembleField(name: string, fieldType: string, kwargs: string[]): string {
  const args = kwargs.join(', ')
  return `${name} = models.${fieldType}(${args})`
}

/** Map Prisma onDelete enum → Django models.* constant. */
function djangoOnDelete(prismaOnDelete: string): string {
  const map: Record<string, string> = {
    Cascade: 'CASCADE',
    Restrict: 'RESTRICT',
    SetNull: 'SET_NULL',
    SetDefault: 'SET_DEFAULT',
    NoAction: 'DO_NOTHING',
  }
  return map[prismaOnDelete] ?? 'DO_NOTHING'
}

function emitMeta(model: ModelDef): string {
  const lines: string[] = []
  let dbTable: string | null = null
  const indexes: string[] = []
  const uniques: string[] = []

  for (const a of model.blockAttrs) {
    if (a.name === 'map' && a.args[0]) {
      dbTable = a.args[0]
    } else if (a.name === 'index' && a.args[0]) {
      indexes.push(toFieldList(a.args[0]))
    } else if (a.name === 'unique' && a.args[0]) {
      uniques.push(toFieldList(a.args[0]))
    }
  }

  if (dbTable) lines.push(`        db_table = ${dbTable}`)

  if (indexes.length > 0) {
    lines.push('        indexes = [')
    for (const ix of indexes) {
      lines.push(`            models.Index(fields=${ix}),`)
    }
    lines.push('        ]')
  }

  if (uniques.length > 0) {
    lines.push('        constraints = [')
    for (const u of uniques) {
      const slug = u
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase()
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '')
      lines.push(
        `            models.UniqueConstraint(fields=${u}, name="uniq_${slug}"),`,
      )
    }
    lines.push('        ]')
  }

  if (lines.length === 0) return ''
  return ['    class Meta:', ...lines].join('\n')
}

/** [a, b, c] → ["a_snake", "b_snake", "c_snake"] as a Python list literal. */
function toFieldList(arrLit: string): string {
  const inner = arrLit.replace(/^\[|\]$/g, '')
  const parts = inner
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => `"${camelToSnake(s)}"`)
  return `[${parts.join(', ')}]`
}

function camelToSnake(s: string): string {
  return s.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase()
}

/**
 * Best-effort SQL table name for an unknown target model — snake-plural of
 * the model's PascalCase name. Common irregular plurals (User → users,
 * MenuItem → menu_items) match Django's default; modules using a custom
 * @@map need the operator to fix the FK target post-generate.
 */
function guessTableName(modelName: string): string {
  const snake = camelToSnake(modelName)
  // Avoid double-pluralizing things that already end in 's' (rare).
  return snake.endsWith('s') ? snake : snake + 's'
}

// ─────────────────────────── convenience ─────────────────────────

export async function translatePrismaFile(filePath: string): Promise<string> {
  const src = await readFile(filePath, 'utf-8')
  const models = parsePrismaSchema(src)
  return emitDjangoModels(models)
}

// ─────────────────── SQLAlchemy emitter ─────────────────────────
//
// Same parse tree → SQLAlchemy 2.x typed `Mapped[]` declarations. The
// per-stack copy convention places the result at <out>/backend/app/<pkg>/model.py
// so the existing FastAPI imports (`from app.<pkg>.model import X`) keep working.

const SA_TYPE_MAP: Record<string, { col: string; py: string }> = {
  String: { col: 'String', py: 'str' },
  Int: { col: 'Integer', py: 'int' },
  BigInt: { col: 'BigInteger', py: 'int' },
  Float: { col: 'Float', py: 'float' },
  Decimal: { col: 'Numeric', py: 'Decimal' },
  Boolean: { col: 'Boolean', py: 'bool' },
  DateTime: { col: 'DateTime', py: 'datetime' },
  Json: { col: 'JSON', py: 'dict' },
  Bytes: { col: 'LargeBinary', py: 'bytes' },
}

export function emitSqlAlchemyModels(
  models: ModelDef[],
  registry?: ModelRegistry,
): string {
  // Collect imports needed across the file.
  const colTypes = new Set<string>()
  let usesDateTime = false
  let usesDecimal = false
  let usesUuid4 = false
  let usesIndex = false
  let usesForeignKey = false
  let usesRelationship = false
  let usesList = false

  for (const m of models) {
    if (
      m.blockAttrs.some((a) => a.name === 'index') ||
      m.fields.some((f) => f.attrs.some((a) => a.name === 'index'))
    ) {
      usesIndex = true
    }
    if (m.relations && m.relations.length > 0) {
      usesRelationship = true
      if (m.relations.some((r) => r.isList)) usesList = true
    }
    for (const f of m.fields) {
      if (f.fk) usesForeignKey = true
      const t = SA_TYPE_MAP[f.type]
      if (!t) continue
      colTypes.add(t.col)
      if (f.type === 'DateTime') usesDateTime = true
      if (f.type === 'Decimal') usesDecimal = true
      if (
        f.attrs.some(
          (a) =>
            a.name === 'default' &&
            a.args.some((arg) => arg === 'uuid()' || arg === 'cuid()'),
        )
      ) {
        usesUuid4 = true
      }
    }
  }

  const sortedColTypes = Array.from(colTypes).sort()
  const header: string[] = [
    '"""SQLAlchemy models — generated by b-dash from schema.prisma. DO NOT EDIT."""',
  ]
  if (usesDateTime) header.push('from datetime import datetime, timezone')
  if (usesDecimal) header.push('from decimal import Decimal')
  if (usesUuid4) header.push('from uuid import uuid4')
  if (usesList) header.push('from typing import List')
  header.push('')
  const sqlImports = [
    ...(usesForeignKey ? ['ForeignKey'] : []),
    ...(usesIndex ? ['Index'] : []),
    ...sortedColTypes,
  ]
  header.push(`from sqlalchemy import ${sqlImports.join(', ')}`)
  const ormImports = ['Mapped', 'mapped_column']
  if (usesRelationship) ormImports.push('relationship')
  header.push(`from sqlalchemy.orm import ${ormImports.join(', ')}`)
  header.push('')
  header.push('from app.database import Base')
  if (usesDateTime) {
    header.push('')
    header.push('')
    header.push('def _utcnow() -> datetime:')
    header.push('    return datetime.now(timezone.utc)')
  }

  return (
    header.join('\n') +
    '\n\n\n' +
    models.map((m) => emitSqlAlchemyModel(m, registry)).join('\n\n\n') +
    '\n'
  )
}

function emitSqlAlchemyModel(
  model: ModelDef,
  registry?: ModelRegistry,
): string {
  const tableName = blockMap(model) ?? camelToSnake(model.name) + 's'
  const indexed = blockIndexes(model)

  const fieldLines = model.fields
    .map((f) => emitSqlAlchemyField(f, indexed, registry))
    .filter((s) => s !== null)
    .map((s) => `    ${s}`)
    .join('\n')

  // Virtual ORM accessors — relationship() helpers for both forward and
  // reverse sides. The forward side links the FK column via foreign_keys=
  // when the model has multiple FKs into the same table (rare but
  // unambiguous to always emit).
  const relationLines = (model.relations ?? [])
    .map((r) => emitSqlAlchemyRelation(r))
    .map((s) => `    ${s}`)
    .join('\n')

  const tableArgs = blockTableArgs(model)
  const lines: string[] = [
    `class ${model.name}(Base):`,
    `    __tablename__ = "${tableName}"`,
  ]
  if (tableArgs.length > 0) {
    lines.push('    __table_args__ = (')
    for (const ta of tableArgs) lines.push(`        ${ta},`)
    lines.push('    )')
  }
  lines.push('')
  lines.push(fieldLines)
  if (relationLines) {
    lines.push('')
    lines.push(relationLines)
  }

  return lines.join('\n')
}


/** Emit a single SQLAlchemy `relationship(...)` line. */
function emitSqlAlchemyRelation(r: RelationAccessor): string {
  const pyName = camelToSnake(r.name)
  const target = r.targetModel
  const args = [
    JSON.stringify(target),
    `back_populates=${JSON.stringify(camelToSnake(r.inverseFieldName))}`,
  ]
  if (r.isList) {
    return `${pyName}: Mapped[List["${target}"]] = relationship(${args.join(', ')})`
  }
  return `${pyName}: Mapped["${target}"] = relationship(${args.join(', ')})`
}


function emitSqlAlchemyField(
  f: FieldDef,
  indexedFields: Set<string>,
  registry?: ModelRegistry,
): string | null {
  const t = SA_TYPE_MAP[f.type]
  if (!t) return `# unsupported type: ${f.name}: ${f.type}`

  const pyName = camelToSnake(f.name)
  const colArgs: string[] = []
  let pyType = t.py
  let hasDefault = false
  let isUuidString = false

  // String → String(N) sized via @db.VarChar / @db.Text fallback to String(255)
  if (t.col === 'String') {
    const dbVarChar = f.attrs.find((a) => a.name === 'db.VarChar')
    const dbText = f.attrs.find((a) => a.name === 'db.Text')
    if (dbText) {
      colArgs.push('Text')
    } else {
      const max = dbVarChar?.args[0] ?? '255'
      colArgs.push(`String(${max})`)
    }
  } else if (t.col === 'Numeric') {
    const dec = f.attrs.find((a) => a.name === 'db.Decimal')
    const [p, s] = dec?.args ?? ['12', '2']
    colArgs.push(`Numeric(${p}, ${s})`)
  } else {
    colArgs.push(t.col)
  }

  if (f.attrs.some((a) => a.name === 'id')) colArgs.push('primary_key=True')
  if (f.attrs.some((a) => a.name === 'unique')) colArgs.push('unique=True')

  // FK promotion — scalar fields tagged by the parser's @relation
  // post-process gain a ForeignKey constraint. Registry lookup gives an
  // accurate ``<table>.<col>`` string (honouring the target model's
  // @@map); falls back to the snake-plural guess when the target isn't
  // in the registry.
  if (f.fk) {
    const target = registry?.get(f.fk.targetModel)
    const targetTable = target?.tableName ?? guessTableName(f.fk.targetModel)
    colArgs.push(
      `ForeignKey(${JSON.stringify(`${targetTable}.${f.fk.targetColumn}`)})`,
    )
  }

  // Default value handling
  for (const a of f.attrs) {
    if (a.name !== 'default' || a.args.length === 0) continue
    const v = a.args[0]
    if (v === 'now()') {
      colArgs.push('default=_utcnow')
      hasDefault = true
    } else if (v === 'uuid()' || v === 'cuid()') {
      // Switch to string id with uuid4 default
      isUuidString = true
      // Replace previous String(255) or whatever with String(36)
      colArgs[0] = 'String(36)'
      colArgs.push('default=lambda: str(uuid4())')
      hasDefault = true
    } else if (v === 'true' || v === 'false') {
      colArgs.push(`default=${v === 'true' ? 'True' : 'False'}`)
      hasDefault = true
    } else if (/^-?\d+(\.\d+)?$/.test(v)) {
      const dv = t.col === 'Numeric' ? `Decimal("${v}")` : v
      colArgs.push(`default=${dv}`)
      hasDefault = true
    } else if (/^".*"$/.test(v) || /^'.*'$/.test(v)) {
      colArgs.push(`default=${v.replace(/"/g, "'")}`)
      hasDefault = true
    } else {
      colArgs.push(`default=${v}`)
      hasDefault = true
    }
  }

  if (f.attrs.some((a) => a.name === 'updatedAt')) {
    colArgs.push('default=_utcnow', 'onupdate=_utcnow')
    hasDefault = true
  }

  // Field-level @index → declared at __table_args__ instead; mark column index=True.
  if (indexedFields.has(f.name)) colArgs.push('index=True')

  if (f.isOptional) {
    colArgs.push('nullable=True')
    pyType = `${pyType} | None`
  }

  // Mark Decimal py type properly when isUuidString
  if (isUuidString) pyType = 'str'

  void hasDefault // kept for potential future "no default → init required" hint

  return `${pyName}: Mapped[${pyType}] = mapped_column(${colArgs.join(', ')})`
}

function blockMap(model: ModelDef): string | null {
  const a = model.blockAttrs.find((x) => x.name === 'map')
  if (!a) return null
  return a.args[0]?.replace(/^"|"$/g, '') ?? null
}

function blockIndexes(model: ModelDef): Set<string> {
  // Single-column @@index([col]) → flag as index=True on that column for
  // simpler SQL. Multi-column indexes go to __table_args__ (via blockTableArgs).
  const out = new Set<string>()
  for (const a of model.blockAttrs) {
    if (a.name !== 'index' || !a.args[0]) continue
    const inner = a.args[0].replace(/^\[|\]$/g, '')
    const parts = inner.split(',').map((s) => s.trim()).filter(Boolean)
    if (parts.length === 1) out.add(parts[0])
  }
  return out
}

function blockTableArgs(model: ModelDef): string[] {
  const args: string[] = []
  for (const a of model.blockAttrs) {
    if (!a.args[0]) continue
    if (a.name === 'index') {
      const inner = a.args[0].replace(/^\[|\]$/g, '')
      const parts = inner.split(',').map((s) => s.trim()).filter(Boolean)
      if (parts.length > 1) {
        const cols = parts.map((p) => `"${camelToSnake(p)}"`).join(', ')
        args.push(`Index("ix_${parts.map(camelToSnake).join('_')}", ${cols})`)
      }
    } else if (a.name === 'unique') {
      const inner = a.args[0].replace(/^\[|\]$/g, '')
      const parts = inner.split(',').map((s) => s.trim()).filter(Boolean)
      const cols = parts.map((p) => `"${camelToSnake(p)}"`).join(', ')
      args.push(
        `Index("uq_${parts.map(camelToSnake).join('_')}", ${cols}, unique=True)`,
      )
    }
  }
  return args
}
