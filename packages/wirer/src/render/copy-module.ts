/**
 * Copy a single module's per-stack files into the generated app's tree.
 *
 * Mapping convention (Phase 1 MVP — formalize in PLAN §19 once stable):
 *
 *   modules/<id>/backend/<stack>/*           ->  <out>/backend/app/<id>/*
 *   modules/<id>/frontend/<fw>/components/*  ->  <out>/frontend/src/components/<id>/*
 *   modules/<id>/frontend/<fw>/lib/api/*     ->  <out>/frontend/src/lib/api/*
 *   modules/<id>/frontend/<fw>/lib/*         ->  <out>/frontend/src/lib/<id>/*
 *   modules/<id>/frontend/<fw>/api-routes/*  ->  <out>/frontend/src/app/api/<id>/*
 *   modules/<id>/schema.prisma               ->  appended to <out>/prisma/schema.prisma
 *   modules/<id>/locales/<lang>.json         ->  merged into <out>/frontend/src/locales/<lang>.json under <id>.* key
 *
 * Pages + tests are deferred — they need layout-aware routing and the test
 * harness scaffold which Chunk C2 will add.
 */
import { access, copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

export type CopyModuleArgs = {
  moduleRoot: string // e.g. /repo/modules/auth
  moduleId: string // e.g. "auth"
  backendStack: string // e.g. "fastapi"
  frontendStack: string // e.g. "nextjs"
  outputDir: string // the temp dir; final location after promote
}

export type CopiedFile = {
  src: string
  dest: string
}

export async function copyModuleFiles(args: CopyModuleArgs): Promise<CopiedFile[]> {
  const copies: CopiedFile[] = []

  // 1. Backend per-stack files. Python pkg names can't contain hyphens, so
  // kebab module ids (events-bus, payment-fake) become snake_case dirs.
  // FastAPI: <out>/backend/app/<pkg>/   (single-package layout, all under app/)
  // Django:  <out>/backend/<pkg>/       (each module is its own Django app)
  // Frontend (Next.js, etc.) tolerates kebab paths so we leave those alone.
  const backendSrc = path.join(args.moduleRoot, 'backend', args.backendStack)
  if (await exists(backendSrc)) {
    const pkg = pythonPkgName(args.moduleId)
    const backendDest =
      args.backendStack === 'django'
        ? path.join(args.outputDir, 'backend', pkg)
        : path.join(args.outputDir, 'backend', 'app', pkg)
    await copyTree(backendSrc, backendDest, copies)
  }

  // 2. Frontend per-framework subtrees
  const frontendSrc = path.join(args.moduleRoot, 'frontend', args.frontendStack)
  if (await exists(frontendSrc)) {
    // 2a. components/* -> src/components/<id>/
    const componentsSrc = path.join(frontendSrc, 'components')
    if (await exists(componentsSrc)) {
      const componentsDest = path.join(
        args.outputDir,
        'frontend',
        'src',
        'components',
        args.moduleId,
      )
      await copyTree(componentsSrc, componentsDest, copies)
    }

    // 2b. lib/api/* -> src/lib/api/* (shared namespace)
    //     lib/<rest>/* -> src/lib/<id>/<rest>/*
    const libSrc = path.join(frontendSrc, 'lib')
    if (await exists(libSrc)) {
      await copyLibTree(libSrc, args, copies)
    }

    // 2c. tests/* -> <out>/frontend/tests/<id>/* (mirrors backend tests).
    //     Module id stays kebab here since Next/Vite tolerates it for paths.
    const feTestsSrc = path.join(frontendSrc, 'tests')
    if (await exists(feTestsSrc)) {
      const feTestsDest = path.join(
        args.outputDir,
        'frontend',
        'tests',
        args.moduleId,
      )
      await copyTree(feTestsSrc, feTestsDest, copies)
    }

    // 2d. api-routes/<base>.ts -> src/app/api/<id>/<base>/route.ts
    const apiRoutesSrc = path.join(frontendSrc, 'api-routes')
    if (await exists(apiRoutesSrc)) {
      const apiBase = path.join(
        args.outputDir,
        'frontend',
        'src',
        'app',
        'api',
        args.moduleId,
      )
      const entries = await readdir(apiRoutesSrc, { withFileTypes: true })
      for (const e of entries) {
        if (!e.isFile()) continue
        const base = path.basename(e.name, path.extname(e.name))
        const ext = path.extname(e.name)
        const dest = path.join(apiBase, base, `route${ext}`)
        await ensureDir(path.dirname(dest))
        const src = path.join(apiRoutesSrc, e.name)
        await copyFile(src, dest)
        copies.push({ src, dest })
      }
    }
  }

  // 3. schema.prisma -> appended to <out>/prisma/schema.prisma
  const prismaSrc = path.join(args.moduleRoot, 'schema.prisma')
  if (await exists(prismaSrc)) {
    const prismaDest = path.join(args.outputDir, 'prisma', 'schema.prisma')
    await ensureDir(path.dirname(prismaDest))
    const fragment = await readFile(prismaSrc, 'utf-8')
    const header = `\n// ===== module: ${args.moduleId} =====\n`
    const existing = (await exists(prismaDest)) ? await readFile(prismaDest, 'utf-8') : ''
    await writeFile(prismaDest, existing + header + fragment, 'utf-8')
    copies.push({ src: prismaSrc, dest: prismaDest })
  }

  // 4. tests/<rest> -> namespaced under <out>/backend/tests/<py-pkg>/<rest>.
  //    These tests at the module root are FastAPI-flavored (they import
  //    from app.<pkg>.X). Skip them when targeting django — that stack
  //    ships its own tests next to the per-stack source under
  //    backend/django/tests/, copied along with the rest of the module
  //    files in step 1.
  if (args.backendStack !== 'django') {
    const testsSrc = path.join(args.moduleRoot, 'tests')
    if (await exists(testsSrc)) {
      const testsDest = path.join(
        args.outputDir,
        'backend',
        'tests',
        pythonPkgName(args.moduleId),
      )
      await copyTree(testsSrc, testsDest, copies)
    }
  }

  // 5. locales/<lang>.json -> namespaced merge into <out>/frontend/src/locales/<lang>.json
  const localesSrc = path.join(args.moduleRoot, 'locales')
  if (await exists(localesSrc)) {
    const entries = await readdir(localesSrc, { withFileTypes: true })
    for (const e of entries) {
      if (!e.isFile() || !e.name.endsWith('.json')) continue
      const lang = path.basename(e.name, '.json')
      const src = path.join(localesSrc, e.name)
      const dest = path.join(
        args.outputDir,
        'frontend',
        'src',
        'locales',
        `${lang}.json`,
      )
      await mergeLocaleJson(src, dest, args.moduleId)
      copies.push({ src, dest })
    }
  }

  return copies
}

/** Walk lib/ — `lib/api/*` is shared, everything else namespaced under `lib/<id>/*`. */
async function copyLibTree(
  libSrc: string,
  args: CopyModuleArgs,
  copies: CopiedFile[],
): Promise<void> {
  const entries = await readdir(libSrc, { withFileTypes: true })
  for (const e of entries) {
    const src = path.join(libSrc, e.name)
    if (e.isDirectory() && e.name === 'api') {
      // Shared API namespace
      const dest = path.join(args.outputDir, 'frontend', 'src', 'lib', 'api')
      await copyTree(src, dest, copies)
    } else if (e.isDirectory()) {
      // Other subdirs go under lib/<id>/<subdir>/
      const dest = path.join(
        args.outputDir,
        'frontend',
        'src',
        'lib',
        args.moduleId,
        e.name,
      )
      await copyTree(src, dest, copies)
    } else if (e.isFile()) {
      // Loose file at lib/ root -> lib/<id>/<file>
      const dest = path.join(
        args.outputDir,
        'frontend',
        'src',
        'lib',
        args.moduleId,
        e.name,
      )
      await ensureDir(path.dirname(dest))
      await copyFile(src, dest)
      copies.push({ src, dest })
    }
  }
}

async function copyTree(
  srcDir: string,
  destDir: string,
  copies: CopiedFile[],
): Promise<void> {
  await ensureDir(destDir)
  const entries = await readdir(srcDir, { withFileTypes: true })
  for (const e of entries) {
    const src = path.join(srcDir, e.name)
    const dest = path.join(destDir, e.name)
    if (e.isDirectory()) {
      await copyTree(src, dest, copies)
    } else if (e.isFile()) {
      await copyFile(src, dest)
      copies.push({ src, dest })
    }
  }
}

async function mergeLocaleJson(
  src: string,
  dest: string,
  moduleId: string,
): Promise<void> {
  await ensureDir(path.dirname(dest))
  const incoming = JSON.parse(await readFile(src, 'utf-8'))
  let merged: Record<string, unknown> = {}
  if (await exists(dest)) {
    merged = JSON.parse(await readFile(dest, 'utf-8'))
  }
  // Module locale files already namespace under their module id (e.g. { "auth": {...} }).
  // Merge top-level keys; later modules win on conflict (warn in real wirer).
  if (typeof incoming === 'object' && incoming !== null) {
    Object.assign(merged, incoming)
  } else {
    merged[moduleId] = incoming
  }
  await writeFile(dest, JSON.stringify(merged, null, 2) + '\n', 'utf-8')
}

async function ensureDir(p: string): Promise<void> {
  await mkdir(p, { recursive: true })
}

async function exists(p: string): Promise<boolean> {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}

/** kebab-case module id -> valid Python package name. */
export function pythonPkgName(moduleId: string): string {
  return moduleId.replace(/-/g, '_')
}
