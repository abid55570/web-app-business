import { mkdtemp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { Recipe } from '@b-dash/schemas'
import { copyModuleFiles } from '../src/render/copy-module.js'
import { render } from '../src/render/index.js'
import { buildWirePlan } from '../src/index.js'
import { scanModules, scanThemes } from '../src/load.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const FIXTURES = resolve(HERE, 'fixtures')
const REPO_MODULES = resolve(HERE, '../../../modules')
const REPO_THEMES = resolve(HERE, '../../../themes')

const baseRecipe: Recipe = {
  schemaVersion: '1.0.0',
  id: 'rendered-app',
  createdAt: '2026-05-09T00:00:00Z',
  archetype: 'business',
  stack: { backend: 'fastapi', frontend: 'nextjs', database: 'postgres' },
  modules: [],
  integrations: {},
  auth: { methods: ['email-password'] },
  theme: { pack: 'minimal' },
  branding: { name: 'Rendered App' },
}

describe('copyModuleFiles', () => {
  let outDir: string

  beforeEach(async () => {
    outDir = await mkdtemp(join(tmpdir(), 'wirer-render-'))
  })

  afterEach(async () => {
    await rm(outDir, { recursive: true, force: true })
  })

  it('copies backend files to <out>/backend/app/<id>/', async () => {
    await copyModuleFiles({
      moduleRoot: join(REPO_MODULES, 'auth'),
      moduleId: 'auth',
      backendStack: 'fastapi',
      frontendStack: 'nextjs',
      outputDir: outDir,
    })

    // Backend files arrive under backend/app/auth/
    const stat1 = await stat(join(outDir, 'backend', 'app', 'auth', 'router.py'))
    expect(stat1.isFile()).toBe(true)
    const router = await readFile(
      join(outDir, 'backend', 'app', 'auth', 'router.py'),
      'utf-8',
    )
    expect(router).toContain('def signup_endpoint')
    expect(router).toContain('def login_endpoint')
  })

  it('copies frontend components to <out>/frontend/src/components/<id>/', async () => {
    await copyModuleFiles({
      moduleRoot: join(REPO_MODULES, 'auth'),
      moduleId: 'auth',
      backendStack: 'fastapi',
      frontendStack: 'nextjs',
      outputDir: outDir,
    })

    const stat1 = await stat(
      join(outDir, 'frontend', 'src', 'components', 'auth', 'login-form.tsx'),
    )
    expect(stat1.isFile()).toBe(true)
  })

  it('copies frontend lib/api/* to shared <out>/frontend/src/lib/api/', async () => {
    await copyModuleFiles({
      moduleRoot: join(REPO_MODULES, 'auth'),
      moduleId: 'auth',
      backendStack: 'fastapi',
      frontendStack: 'nextjs',
      outputDir: outDir,
    })

    // lib/api/auth.ts -> src/lib/api/auth.ts (shared namespace, NOT under <id>/)
    const stat1 = await stat(
      join(outDir, 'frontend', 'src', 'lib', 'api', 'auth.ts'),
    )
    expect(stat1.isFile()).toBe(true)
  })

  it('copies frontend lib/<other>.ts to <out>/frontend/src/lib/<id>/<other>.ts', async () => {
    await copyModuleFiles({
      moduleRoot: join(REPO_MODULES, 'auth'),
      moduleId: 'auth',
      backendStack: 'fastapi',
      frontendStack: 'nextjs',
      outputDir: outDir,
    })

    // session.ts is at lib/ root in the module -> src/lib/auth/session.ts
    const stat1 = await stat(
      join(outDir, 'frontend', 'src', 'lib', 'auth', 'session.ts'),
    )
    expect(stat1.isFile()).toBe(true)
    const stat2 = await stat(
      join(outDir, 'frontend', 'src', 'lib', 'auth', 'constants.ts'),
    )
    expect(stat2.isFile()).toBe(true)
  })

  it('rewrites api-routes/<base>.ts as <out>/frontend/src/app/api/<id>/<base>/route.ts', async () => {
    await copyModuleFiles({
      moduleRoot: join(REPO_MODULES, 'auth'),
      moduleId: 'auth',
      backendStack: 'fastapi',
      frontendStack: 'nextjs',
      outputDir: outDir,
    })

    const expected = [
      'login/route.ts',
      'signup/route.ts',
      'logout/route.ts',
      'me/route.ts',
    ]
    for (const rel of expected) {
      const p = join(outDir, 'frontend', 'src', 'app', 'api', 'auth', rel)
      const s = await stat(p)
      expect(s.isFile(), `${rel} should exist`).toBe(true)
    }
  })

  it('appends schema.prisma to <out>/prisma/schema.prisma with module header', async () => {
    await copyModuleFiles({
      moduleRoot: join(REPO_MODULES, 'auth'),
      moduleId: 'auth',
      backendStack: 'fastapi',
      frontendStack: 'nextjs',
      outputDir: outDir,
    })

    const schema = await readFile(
      join(outDir, 'prisma', 'schema.prisma'),
      'utf-8',
    )
    expect(schema).toContain('// ===== module: auth =====')
    expect(schema).toContain('model User')
  })

  it('merges locales/<lang>.json into <out>/frontend/src/locales/<lang>.json', async () => {
    await copyModuleFiles({
      moduleRoot: join(REPO_MODULES, 'auth'),
      moduleId: 'auth',
      backendStack: 'fastapi',
      frontendStack: 'nextjs',
      outputDir: outDir,
    })

    const en = JSON.parse(
      await readFile(
        join(outDir, 'frontend', 'src', 'locales', 'en.json'),
        'utf-8',
      ),
    )
    expect(en.auth).toBeDefined()
    expect(en.auth.signin.title).toBe('Sign in')
  })

  it('copies frontend/<fw>/tests/ to <out>/frontend/tests/<id>/', async () => {
    await copyModuleFiles({
      moduleRoot: join(REPO_MODULES, 'menu'),
      moduleId: 'menu',
      backendStack: 'fastapi',
      frontendStack: 'nextjs',
      outputDir: outDir,
    })

    const testFile = join(
      outDir,
      'frontend',
      'tests',
      'menu',
      'menu-api.test.ts',
    )
    const content = await readFile(testFile, 'utf-8')
    expect(content).toContain("from '@/lib/api/menu'")
    expect(content).toContain('describe(\'menuApi\'')
  })

  it('copies tests/ to <out>/backend/tests/<py-pkg>/ with snake_case naming', async () => {
    await copyModuleFiles({
      moduleRoot: join(REPO_MODULES, 'events-bus'),
      moduleId: 'events-bus',
      backendStack: 'fastapi',
      frontendStack: 'nextjs',
      outputDir: outDir,
    })

    // events-bus has tests/smoke/test_events_bus.py at the source.
    // Destination must use snake_case (events_bus, not events-bus).
    const testFile = join(
      outDir,
      'backend',
      'tests',
      'events_bus',
      'smoke',
      'test_events_bus.py',
    )
    const content = await readFile(testFile, 'utf-8')
    expect(content).toContain('from app.events_bus.bus import')
    expect(content).toContain('test_emit_calls_subscribed_handler')
  })

  it('skips silently when a module has no files for the chosen stack', async () => {
    // Synthesize a manifest-only module so the test stays valid as real
    // modules grow code (events-bus now ships bus.py).
    const emptyModuleRoot = await mkdtemp(join(tmpdir(), 'wirer-empty-mod-'))
    await writeFile(
      join(emptyModuleRoot, 'module.yaml'),
      'id: empty\ntype: module\nversion: 1.0.0\ndisplayName: Empty\nimplements: [empty@v1]\n',
      'utf-8',
    )
    await copyModuleFiles({
      moduleRoot: emptyModuleRoot,
      moduleId: 'empty',
      backendStack: 'fastapi',
      frontendStack: 'nextjs',
      outputDir: outDir,
    })
    const entries = await readdir(outDir)
    expect(entries).toEqual([])
    await rm(emptyModuleRoot, { recursive: true, force: true })
  })
})

describe('render (full pipeline)', () => {
  let outDir: string

  beforeEach(async () => {
    const tmp = await mkdtemp(join(tmpdir(), 'wirer-full-'))
    outDir = join(tmp, 'rendered-app')
  })

  afterEach(async () => {
    const parent = dirname(outDir)
    await rm(parent, { recursive: true, force: true })
  })

  it('renders a full plan and writes recipe.json + metadata + overrides/', async () => {
    const modules = await scanModules(REPO_MODULES)
    const themes = await scanThemes(REPO_THEMES)

    const recipe: Recipe = {
      ...baseRecipe,
      modules: [
        { id: 'events-bus', version: '1.0.0', config: {} },
        { id: 'auth', version: '1.0.0', config: {} },
      ],
    }
    const plan = buildWirePlan({ recipe, modules, themes })

    const result = await render({
      plan,
      modulesRoot: REPO_MODULES,
      outputDir: outDir,
    })

    expect(result.moduleCount).toBe(2)
    expect(result.fileCount).toBeGreaterThan(0)

    // Metadata
    const recipeJson = JSON.parse(
      await readFile(join(outDir, 'recipe.json'), 'utf-8'),
    )
    expect(recipeJson.id).toBe('rendered-app')
    const version = await readFile(join(outDir, '.b-dash-version'), 'utf-8')
    expect(version.trim()).toBe('0.1.0')
    const readme = await readFile(join(outDir, 'README.md'), 'utf-8')
    expect(readme).toContain('Rendered App')
    expect(readme).toContain('auth v1.0.0')

    // overrides/ stub created (empty, but exists)
    const overridesStat = await stat(join(outDir, 'overrides'))
    expect(overridesStat.isDirectory()).toBe(true)
  })

  it('preserves overrides/ across re-renders', async () => {
    const modules = await scanModules(REPO_MODULES)
    const themes = await scanThemes(REPO_THEMES)
    const recipe: Recipe = {
      ...baseRecipe,
      modules: [{ id: 'auth', version: '1.0.0', config: {} }],
    }
    const plan = buildWirePlan({ recipe, modules, themes })

    // First render
    await render({ plan, modulesRoot: REPO_MODULES, outputDir: outDir })

    // Add a customer override
    const { writeFile, mkdir } = await import('node:fs/promises')
    await mkdir(join(outDir, 'overrides', 'styles'), { recursive: true })
    await writeFile(
      join(outDir, 'overrides', 'styles', 'custom.css'),
      '/* my customization */',
      'utf-8',
    )

    // Re-render
    await render({ plan, modulesRoot: REPO_MODULES, outputDir: outDir })

    // Override should still be there
    const customCss = await readFile(
      join(outDir, 'overrides', 'styles', 'custom.css'),
      'utf-8',
    )
    expect(customCss).toBe('/* my customization */')
  })

  it('overlays overrides/ on top of regenerated files', async () => {
    const modules = await scanModules(REPO_MODULES)
    const themes = await scanThemes(REPO_THEMES)
    const recipe: Recipe = {
      ...baseRecipe,
      modules: [{ id: 'auth', version: '1.0.0', config: {} }],
    }
    const plan = buildWirePlan({ recipe, modules, themes })

    // First render
    const first = await render({
      plan,
      modulesRoot: REPO_MODULES,
      outputDir: outDir,
    })
    expect(first.overrides).toEqual([])

    // Customer drops an override targeting README.md
    await writeFile(
      join(outDir, 'overrides', 'README.md'),
      '# Customer fork — do not regenerate this file.\n',
      'utf-8',
    )

    // Re-render
    const second = await render({
      plan,
      modulesRoot: REPO_MODULES,
      outputDir: outDir,
    })

    // Override applied: README.md at top level matches customer content.
    const readme = await readFile(join(outDir, 'README.md'), 'utf-8')
    expect(readme).toBe('# Customer fork — do not regenerate this file.\n')

    // RenderResult exposes the overlay surface.
    expect(second.overrides.map((o) => o.relPath)).toEqual(['README.md'])

    // Manifest written next to the version file (v2 schema:
    // {relPath, bytes, generatedHash} per file).
    const manifest = JSON.parse(
      await readFile(join(outDir, '.b-dash-overrides.json'), 'utf-8'),
    )
    expect(manifest.version).toBe(2)
    expect(manifest.count).toBe(1)
    expect(
      manifest.files.map((f: { relPath: string }) => f.relPath),
    ).toEqual(['README.md'])
    // generatedHash captured from the wirer's README pre-overlay.
    expect(manifest.files[0].generatedHash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('overlay handles nested override paths + multi-file manifests', async () => {
    const modules = await scanModules(REPO_MODULES)
    const themes = await scanThemes(REPO_THEMES)
    const recipe: Recipe = {
      ...baseRecipe,
      modules: [{ id: 'auth', version: '1.0.0', config: {} }],
    }
    const plan = buildWirePlan({ recipe, modules, themes })

    // Initial render so overrides/ exists.
    await render({ plan, modulesRoot: REPO_MODULES, outputDir: outDir })

    // Drop two overrides in different subdirs.
    await mkdir(join(outDir, 'overrides', 'backend', 'app'), { recursive: true })
    await writeFile(
      join(outDir, 'overrides', 'backend', 'app', 'forked.py'),
      '# forked\n',
      'utf-8',
    )
    await mkdir(join(outDir, 'overrides', 'frontend', 'src', 'styles'), {
      recursive: true,
    })
    await writeFile(
      join(outDir, 'overrides', 'frontend', 'src', 'styles', 'brand.css'),
      '/* brand */',
      'utf-8',
    )

    const result = await render({
      plan,
      modulesRoot: REPO_MODULES,
      outputDir: outDir,
    })

    // Both files overlaid into their relative paths (paths normalized
    // to forward slashes so assertions are cross-platform).
    expect(result.overrides.map((o) => o.relPath).sort()).toEqual([
      'backend/app/forked.py',
      'frontend/src/styles/brand.css',
    ])
    expect(
      await readFile(join(outDir, 'backend', 'app', 'forked.py'), 'utf-8'),
    ).toBe('# forked\n')
    expect(
      await readFile(
        join(outDir, 'frontend', 'src', 'styles', 'brand.css'),
        'utf-8',
      ),
    ).toBe('/* brand */')
  })

  it('refuses to render when conflicts exist', async () => {
    const modules = await scanModules(REPO_MODULES)
    const themes = await scanThemes(REPO_THEMES)

    // conflict-a + conflict-b both claim /admin/orders
    const recipe: Recipe = {
      ...baseRecipe,
      modules: [
        { id: 'conflict-a', version: '1.0.0', config: {} },
        { id: 'conflict-b', version: '1.0.0', config: {} },
      ],
    }

    // These fixture modules live under packages/wirer/tests/fixtures/modules/,
    // not the repo modules/. Use those as the source of truth.
    const fixtureModules = await scanModules(join(FIXTURES, 'modules'))
    const fixtureThemes = await scanThemes(join(FIXTURES, 'themes'))
    const plan = buildWirePlan({
      recipe,
      modules: fixtureModules,
      themes: fixtureThemes,
    })

    await expect(
      render({
        plan,
        modulesRoot: join(FIXTURES, 'modules'),
        outputDir: outDir,
      }),
    ).rejects.toThrow(/file conflict/)
  })

  it('emits vercel deploy config when deployTarget is set', async () => {
    const modules = await scanModules(REPO_MODULES)
    const themes = await scanThemes(REPO_THEMES)
    const recipe: Recipe = {
      ...baseRecipe,
      stack: { ...baseRecipe.stack, deployTarget: 'vercel' },
      modules: [{ id: 'auth', version: '1.0.0', config: {} }],
    }
    const plan = buildWirePlan({ recipe, modules, themes })

    const result = await render({
      plan,
      modulesRoot: REPO_MODULES,
      outputDir: outDir,
    })

    expect(result.deploy.target).toBe('vercel')
    const paths = result.deploy.artifacts.map((a) => a.relPath).sort()
    expect(paths).toEqual(['.vercelignore', 'vercel.json'])

    const vercelJson = JSON.parse(
      await readFile(join(outDir, 'vercel.json'), 'utf-8'),
    )
    expect(vercelJson.framework).toBe('nextjs')
    expect(Object.keys(vercelJson.env)).toEqual(
      expect.arrayContaining(['DATABASE_URL', 'JWT_SECRET']),
    )
  })

  it('emits Dockerfile + compose when deployTarget is docker-zip', async () => {
    const modules = await scanModules(REPO_MODULES)
    const themes = await scanThemes(REPO_THEMES)
    const recipe: Recipe = {
      ...baseRecipe,
      stack: { ...baseRecipe.stack, deployTarget: 'docker-zip' },
      modules: [{ id: 'auth', version: '1.0.0', config: {} }],
    }
    const plan = buildWirePlan({ recipe, modules, themes })

    const result = await render({
      plan,
      modulesRoot: REPO_MODULES,
      outputDir: outDir,
    })

    const paths = result.deploy.artifacts.map((a) => a.relPath).sort()
    expect(paths).toEqual(['.dockerignore', 'Dockerfile', 'docker-compose.yml'])

    const dockerfile = await readFile(join(outDir, 'Dockerfile'), 'utf-8')
    expect(dockerfile).toContain('FROM node:20-alpine AS frontend-builder')
    expect(dockerfile).toContain('uvicorn app.main:app')

    const compose = await readFile(
      join(outDir, 'docker-compose.yml'),
      'utf-8',
    )
    expect(compose).toContain('postgres:16-alpine')
  })

  it('infers env keys from module list (stripe + resend)', async () => {
    const modules = await scanModules(REPO_MODULES)
    const themes = await scanThemes(REPO_THEMES)
    const recipe: Recipe = {
      ...baseRecipe,
      stack: { ...baseRecipe.stack, deployTarget: 'vercel' },
      modules: [
        { id: 'events-bus', version: '1.0.0', config: {} },
        { id: 'auth-core', version: '1.0.0', config: {} },
        { id: 'auth-jwt', version: '1.0.0', config: {} },
        { id: 'payment-core', version: '1.0.0', config: {} },
        { id: 'payment-stripe', version: '1.0.0', config: {} },
        { id: 'notifications', version: '1.0.0', config: {} },
        { id: 'notifications-resend', version: '1.0.0', config: {} },
      ],
    }
    const plan = buildWirePlan({ recipe, modules, themes })

    await render({ plan, modulesRoot: REPO_MODULES, outputDir: outDir })
    const vercelJson = JSON.parse(
      await readFile(join(outDir, 'vercel.json'), 'utf-8'),
    )
    const keys = Object.keys(vercelJson.env)
    expect(keys).toEqual(
      expect.arrayContaining([
        'DATABASE_URL',
        'JWT_SECRET',
        'RESEND_API_KEY',
        'STRIPE_API_KEY',
        'STRIPE_WEBHOOK_SECRET',
      ]),
    )
  })

  it('omits deploy files when deployTarget is not set', async () => {
    const modules = await scanModules(REPO_MODULES)
    const themes = await scanThemes(REPO_THEMES)
    const recipe: Recipe = {
      ...baseRecipe,
      modules: [{ id: 'auth', version: '1.0.0', config: {} }],
    }
    const plan = buildWirePlan({ recipe, modules, themes })

    const result = await render({
      plan,
      modulesRoot: REPO_MODULES,
      outputDir: outDir,
    })
    expect(result.deploy.target).toBeNull()
    expect(result.deploy.artifacts).toEqual([])
  })
})
