import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { Recipe } from '@b-dash/schemas'
import { buildWirePlan } from '../src/index.js'
import { scanModules, scanThemes } from '../src/load.js'
import { derivePackageJson } from '../src/render/derive-package-json.js'
import { derivePyproject } from '../src/render/derive-pyproject.js'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_THEMES = resolve(HERE, '../../../themes')

const baseRecipe: Recipe = {
  schemaVersion: '1.0.0',
  id: 'deps-test-app',
  createdAt: '2026-05-09T00:00:00Z',
  archetype: 'business',
  stack: { backend: 'fastapi', frontend: 'nextjs', database: 'postgres' },
  modules: [],
  integrations: {},
  auth: { methods: ['email-password'] },
  theme: { pack: 'minimal' },
  branding: { name: 'Deps Test App' },
}

const SCAFFOLD_PKG_JSON = {
  name: 'spike-frontend',
  version: '0.1.0',
  private: true,
  dependencies: { next: '^15.0.0', react: '^19.0.0' },
  devDependencies: { typescript: '^5.6.0' },
}

const SCAFFOLD_PYPROJECT = `[project]
name = "spike-backend"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.115.0",
    "uvicorn[standard]>=0.32.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.3.0",
]
`

/**
 * Synthesize a temp modules root with two manifest-only modules carrying
 * dependency blocks, so we exercise the merge logic without polluting real
 * modules.
 */
async function makeFixtureModules(root: string): Promise<void> {
  const modA = join(root, 'mod-a')
  await mkdir(modA, { recursive: true })
  await writeFile(
    join(modA, 'module.yaml'),
    `id: mod-a
type: module
version: 1.0.0
displayName: Mod A
implements: [moda@v1]
dependencies:
  frontend:
    stripe: "^15.0.0"
    sonner: "^1.7.0"
  frontendDev:
    "@types/stripe": "^8.0.0"
  backend:
    - "stripe>=10.0.0"
    - "boto3>=1.35.0"
  backendDev:
    - "moto>=5.0.0"
`,
    'utf-8',
  )

  const modB = join(root, 'mod-b')
  await mkdir(modB, { recursive: true })
  await writeFile(
    join(modB, 'module.yaml'),
    `id: mod-b
type: module
version: 1.0.0
displayName: Mod B
implements: [modb@v1]
dependencies:
  frontend:
    stripe: "^15.2.0"   # version conflict with mod-a; later wins
    twilio: "^4.0.0"
  backend:
    - "twilio>=9.0.0"
`,
    'utf-8',
  )
}

describe('derivePackageJson', () => {
  let outDir: string
  let modsRoot: string

  beforeEach(async () => {
    outDir = await mkdtemp(join(tmpdir(), 'wirer-deps-out-'))
    modsRoot = await mkdtemp(join(tmpdir(), 'wirer-deps-mods-'))
    await makeFixtureModules(modsRoot)
    // Place a scaffold-style package.json at the destination first.
    await mkdir(join(outDir, 'frontend'), { recursive: true })
    await writeFile(
      join(outDir, 'frontend', 'package.json'),
      JSON.stringify(SCAFFOLD_PKG_JSON, null, 2),
      'utf-8',
    )
  })

  afterEach(async () => {
    await rm(outDir, { recursive: true, force: true })
    await rm(modsRoot, { recursive: true, force: true })
  })

  it('merges per-module frontend deps + dev deps + renames pkg', async () => {
    const modules = await scanModules(modsRoot)
    const themes = await scanThemes(REPO_THEMES)
    const recipe: Recipe = {
      ...baseRecipe,
      modules: [
        { id: 'mod-a', version: '1.0.0', config: {} },
        { id: 'mod-b', version: '1.0.0', config: {} },
      ],
    }
    const plan = buildWirePlan({ recipe, modules, themes })

    const dest = await derivePackageJson({ plan, outputDir: outDir })
    expect(dest).not.toBeNull()
    const pkg = JSON.parse(await readFile(dest!, 'utf-8'))

    // Recipe id wins on package name
    expect(pkg.name).toBe('deps-test-app')
    // Scaffold deps still present
    expect(pkg.dependencies.next).toBe('^15.0.0')
    expect(pkg.dependencies.react).toBe('^19.0.0')
    // Module deps merged
    expect(pkg.dependencies.sonner).toBe('^1.7.0')
    expect(pkg.dependencies.twilio).toBe('^4.0.0')
    // Conflict resolution: later module (mod-b) wins
    expect(pkg.dependencies.stripe).toBe('^15.2.0')
    // Dev deps
    expect(pkg.devDependencies['@types/stripe']).toBe('^8.0.0')
    expect(pkg.devDependencies.typescript).toBe('^5.6.0')
    // Sorted
    const depKeys = Object.keys(pkg.dependencies)
    expect(depKeys).toEqual([...depKeys].sort())
  })

  it('returns null when there is no frontend/package.json', async () => {
    const fresh = await mkdtemp(join(tmpdir(), 'wirer-no-fe-'))
    const modules = await scanModules(modsRoot)
    const themes = await scanThemes(REPO_THEMES)
    const plan = buildWirePlan({
      recipe: { ...baseRecipe, modules: [] },
      modules,
      themes,
    })
    const result = await derivePackageJson({ plan, outputDir: fresh })
    expect(result).toBeNull()
    await rm(fresh, { recursive: true, force: true })
  })
})

describe('derivePyproject', () => {
  let outDir: string
  let modsRoot: string

  beforeEach(async () => {
    outDir = await mkdtemp(join(tmpdir(), 'wirer-py-out-'))
    modsRoot = await mkdtemp(join(tmpdir(), 'wirer-py-mods-'))
    await makeFixtureModules(modsRoot)
    await mkdir(join(outDir, 'backend'), { recursive: true })
    await writeFile(
      join(outDir, 'backend', 'pyproject.toml'),
      SCAFFOLD_PYPROJECT,
      'utf-8',
    )
  })

  afterEach(async () => {
    await rm(outDir, { recursive: true, force: true })
    await rm(modsRoot, { recursive: true, force: true })
  })

  it('appends per-module backend deps + dev deps with attribution comments', async () => {
    const modules = await scanModules(modsRoot)
    const themes = await scanThemes(REPO_THEMES)
    const recipe: Recipe = {
      ...baseRecipe,
      modules: [
        { id: 'mod-a', version: '1.0.0', config: {} },
        { id: 'mod-b', version: '1.0.0', config: {} },
      ],
    }
    const plan = buildWirePlan({ recipe, modules, themes })

    const dest = await derivePyproject({ plan, outputDir: outDir })
    expect(dest).not.toBeNull()
    const toml = await readFile(dest!, 'utf-8')

    // Recipe id renames the project
    expect(toml).toMatch(/name = "deps-test-app-backend"/)
    // Scaffold deps still there
    expect(toml).toContain('"fastapi>=0.115.0"')
    // Module main deps appended with attribution
    expect(toml).toContain('"stripe>=10.0.0",  # from mod-a')
    expect(toml).toContain('"boto3>=1.35.0",  # from mod-a')
    expect(toml).toContain('"twilio>=9.0.0",  # from mod-b')
    // Dev deps appended into the [project.optional-dependencies] dev array
    expect(toml).toContain('"moto>=5.0.0",  # from mod-a')
    // Original pytest dev dep preserved
    expect(toml).toContain('"pytest>=8.3.0"')
  })
})
