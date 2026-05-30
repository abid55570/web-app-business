/**
 * Per-module model.py emitter for the FastAPI / SQLAlchemy stack.
 *
 * Mirrors derive-django-models: if a module ships a hand-written
 * ``backend/fastapi/model.py`` (e.g. modules built before the translator),
 * we leave it alone. Otherwise we translate the module's ``schema.prisma``
 * into a SQLAlchemy 2.x ``Mapped[]`` declaration set via ``prisma.ts``.
 *
 * Convention: output lands at <out>/backend/app/<pkg>/model.py so existing
 * imports (``from app.<pkg>.model import X``) keep working.
 */
import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { WirePlan } from '../types.js'
import {
  buildModelRegistry,
  emitSqlAlchemyModels,
  pairAcrossFiles,
  parsePrismaSchema,
  type ModelDef,
} from '../db/prisma.js'
import { pythonPkgName } from './copy-module.js'

export async function deriveSqlAlchemyModels(args: {
  plan: WirePlan
  modulesRoot: string
  outputDir: string
}): Promise<{ generated: string[]; skipped: string[] }> {
  const generated: string[] = []
  const skipped: string[] = []

  // Pass 1: parse every schema we can find so the FK emitter resolves
  // cross-module target tables to their @@map values instead of guessing.
  const perModule: {
    moduleId: string
    pythonPkg: string
    models: ModelDef[]
  }[] = []
  for (const m of args.plan.resolvedRecipe.modules) {
    const prisma = path.join(args.modulesRoot, m.id, 'schema.prisma')
    if (!(await exists(prisma))) continue
    const src = await readFile(prisma, 'utf-8')
    perModule.push({
      moduleId: m.id,
      pythonPkg: pythonPkgName(m.id),
      models: parsePrismaSchema(src),
    })
  }
  // Cross-file relation pairing — within-file pairs already wired by the
  // parser; this matches forwards in module A with reverses in module B.
  pairAcrossFiles(perModule.flatMap((p) => p.models))

  const registry = buildModelRegistry(perModule)
  if (!registry.has('User')) {
    registry.set('User', {
      tableName: 'users',
      sourceModuleId: 'auth-core',
      pythonPkg: 'auth_core',
    })
  }

  // Pass 2: emit per-module model.py.
  const parsedByModule = new Map(perModule.map((p) => [p.moduleId, p.models]))
  for (const m of args.plan.resolvedRecipe.modules) {
    const pkg = pythonPkgName(m.id)
    const moduleRoot = path.join(args.modulesRoot, m.id)
    const appDir = path.join(args.outputDir, 'backend', 'app', pkg)

    const handWritten = path.join(moduleRoot, 'backend', 'fastapi', 'model.py')

    if (await exists(handWritten)) {
      skipped.push(m.id)
      continue
    }
    const models = parsedByModule.get(m.id)
    if (!models || models.length === 0) {
      skipped.push(m.id)
      continue
    }

    await mkdir(appDir, { recursive: true })
    await ensureFile(path.join(appDir, '__init__.py'), '')
    const py = emitSqlAlchemyModels(models, registry)
    await writeFile(path.join(appDir, 'model.py'), py, 'utf-8')
    generated.push(m.id)
  }

  return { generated, skipped }
}

async function ensureFile(p: string, contents: string): Promise<void> {
  if (await exists(p)) return
  await writeFile(p, contents, 'utf-8')
}

async function exists(p: string): Promise<boolean> {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}
