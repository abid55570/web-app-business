/**
 * Copy the per-stack scaffold (base FastAPI / Next.js skeleton) into the
 * output directory. Runs BEFORE module copy so module files layer on top.
 *
 * Scaffold dirs live at packages/wirer/scaffold/<area>/<framework>/. tsup
 * doesn't bundle them; they ship via `package.json:files` and are resolved
 * at runtime via `import.meta.url`.
 */
import { access, copyFile, mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// dist/index.js -> ../scaffold/  (tsup bundles to packages/wirer/dist/)
const SCAFFOLD_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'scaffold',
)

export type ScaffoldArea = 'backend' | 'frontend'

const DEST_PREFIXES: Record<ScaffoldArea, string> = {
  backend: 'backend',
  frontend: 'frontend',
}

export async function copyScaffold(args: {
  area: ScaffoldArea
  stack: string // 'fastapi' | 'nextjs' | etc.
  outputDir: string
}): Promise<{ files: number }> {
  const src = path.join(SCAFFOLD_ROOT, args.area, args.stack)
  if (!(await exists(src))) {
    // No scaffold for this stack — return 0 silently. Not all stacks supported yet.
    return { files: 0 }
  }
  const dest = path.join(args.outputDir, DEST_PREFIXES[args.area])
  let count = 0
  await copyTree(src, dest, () => {
    count++
  })
  return { files: count }
}

async function copyTree(
  src: string,
  dest: string,
  onFile: () => void,
): Promise<void> {
  await mkdir(dest, { recursive: true })
  const entries = await readdir(src, { withFileTypes: true })
  for (const e of entries) {
    const s = path.join(src, e.name)
    const d = path.join(dest, e.name)
    if (e.isDirectory()) {
      await copyTree(s, d, onFile)
    } else if (e.isFile()) {
      await copyFile(s, d)
      onFile()
    }
  }
}

async function exists(p: string): Promise<boolean> {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}

/** Test hook: where the wirer expects to find scaffold files. */
export function getScaffoldRoot(): string {
  return SCAFFOLD_ROOT
}
