/**
 * Top-level render: take a wire plan + on-disk module sources, produce a
 * generated app on disk.
 *
 * MVP scope (Phase 1 Chunk C):
 *   - Copy module files via copyModuleFiles (convention-based mapping)
 *   - Emit recipe.json + .b-dash-version metadata
 *   - Atomic temp -> output promote
 *
 * Deferred (Chunk C2 / D2):
 *   - Base scaffold (Next.js + FastAPI skeleton files)
 *   - Tailwind config + globals.css from theme tokens
 *   - package.json / requirements.txt deps merging
 *   - main.py router include block
 *   - pnpm install + smoke tests
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { WirePlan } from '../types.js'
import { WirerError } from '../errors.js'
import { copyModuleFiles, type CopiedFile } from './copy-module.js'
import { copyScaffold } from './scaffold.js'
import { copySections } from './copy-sections.js'
import { overlayOverrides, type OverlaidFile } from './overlay-overrides.js'
import { deriveDeploy, type DeployArtifact } from './derive-deploy.js'
import { deriveAdaptersPy } from './derive-adapters-py.js'
import { deriveDjangoModels } from './derive-django-models.js'
import { deriveDjangoSettings } from './derive-django-settings.js'
import { deriveDjangoUrls } from './derive-django-urls.js'
import { deriveMainPy } from './derive-main-py.js'
import { derivePackageJson } from './derive-package-json.js'
import { derivePyproject } from './derive-pyproject.js'
import { deriveSqlAlchemyModels } from './derive-sqlalchemy-models.js'
import { deriveSubscriptions } from './derive-subscriptions.js'
import { deriveTailwindConfig } from './derive-tailwind-config.js'
import { deriveGlobalsCss } from './derive-tokens-css.js'
import { promote, rollback } from './promote.js'

const RENDER_VERSION = '0.1.0'

export type RenderOptions = {
  plan: WirePlan
  modulesRoot: string
  outputDir: string
  /** Optional path to a sections/ root. When provided, all sections found
   * via scanSections are copied into <out>/frontend/src/sections/. */
  sectionsRoot?: string
}

export type RenderResult = {
  outputDir: string
  moduleCount: number
  fileCount: number
  files: CopiedFile[]
  /** Files overlaid from <output>/overrides/ on top of the regen.
   * Empty when no overrides/ was present. */
  overrides: OverlaidFile[]
  /** Deploy-target config files written when recipe.stack.deployTarget
   * is set. `target` is null when no target is selected. */
  deploy: { target: string | null; artifacts: DeployArtifact[] }
}

export async function render(opts: RenderOptions): Promise<RenderResult> {
  const { plan, modulesRoot, outputDir, sectionsRoot } = opts

  if (plan.conflicts.length > 0) {
    throw new WirerError(
      'WIRER_FILE_CONFLICT',
      `Refusing to render: ${plan.conflicts.length} file conflict(s) detected. Resolve them in the recipe first.`,
      { conflicts: plan.conflicts },
    )
  }

  const tempDir = `${outputDir}.tmp.${Date.now()}`
  const allCopies: CopiedFile[] = []

  try {
    await mkdir(tempDir, { recursive: true })

    // 1. Scaffold first (base files for the chosen stacks)
    await copyScaffold({
      area: 'backend',
      stack: plan.resolvedRecipe.recipe.stack.backend,
      outputDir: tempDir,
    })
    await copyScaffold({
      area: 'frontend',
      stack: plan.resolvedRecipe.recipe.stack.frontend,
      outputDir: tempDir,
    })

    // 2. Module files layered on top
    for (const m of plan.resolvedRecipe.modules) {
      const copies = await copyModuleFiles({
        moduleRoot: path.join(modulesRoot, m.id),
        moduleId: m.id,
        backendStack: plan.resolvedRecipe.recipe.stack.backend,
        frontendStack: plan.resolvedRecipe.recipe.stack.frontend,
        outputDir: tempDir,
      })
      allCopies.push(...copies)
    }

    // 2b. Sections — drag-and-droppable UI blocks (Hero, FeatureGrid, ...).
    //     Copies every discovered section into <out>/frontend/src/sections/<id>/
    //     so Studio can pick them up via the .studio.json siblings.
    if (sectionsRoot) {
      const { scanSections } = await import('../load.js')
      const sections = await scanSections(sectionsRoot)
      await copySections({ sections, outputDir: tempDir })
    }

    // 3. Derive backend entry from the module list. Stack-aware:
    //    - fastapi: main.py with router includes + lifespan model imports;
    //               _subscriptions.py registering bus handlers at startup.
    //    - django:  config/urls.py mounting per-module URLconfs;
    //               config/settings.py amended with INSTALLED_APPS + AUTH_USER_MODEL.
    const backendStack = plan.resolvedRecipe.recipe.stack.backend
    if (backendStack === 'fastapi') {
      // Translate schema.prisma → SQLAlchemy model.py for any module that
      // didn't hand-write one. Existing modules (auth-core, menu, orders, ...)
      // ship hand-written model.py and are skipped.
      await deriveSqlAlchemyModels({ plan, modulesRoot, outputDir: tempDir })
      await deriveAdaptersPy({ plan, modulesRoot, outputDir: tempDir })
      await deriveMainPy({ plan, modulesRoot, outputDir: tempDir })
      await deriveSubscriptions({ plan, outputDir: tempDir })
    } else if (backendStack === 'django') {
      // Translate each module's schema.prisma into a Django models.py
      // (skip modules that shipped a hand-written one, e.g. auth-core's
      // custom AbstractBaseUser). Also stub apps.py/__init__.py for any
      // module dir that didn't author them.
      await deriveDjangoModels({ plan, modulesRoot, outputDir: tempDir })
      await deriveDjangoUrls({ plan, modulesRoot, outputDir: tempDir })
      await deriveDjangoSettings({ plan, modulesRoot, outputDir: tempDir })
    }

    // 4. Compile theme tokens -> globals.css with CSS variables
    await deriveGlobalsCss({ theme: plan.resolvedRecipe.theme, outputDir: tempDir })

    // 4a. Compile theme tokens -> tailwind.config.ts (numeric scales + fonts)
    await deriveTailwindConfig({
      theme: plan.resolvedRecipe.theme,
      outputDir: tempDir,
    })

    // 4b. Merge per-module deps into package.json + pyproject.toml so
    //     `pnpm install` and `pip install -e .` pull everything modules need.
    await derivePackageJson({ plan, outputDir: tempDir })
    await derivePyproject({ plan, outputDir: tempDir })

    // 4c. Emit deploy-target config (vercel.json / render.yaml /
    //     Dockerfile / etc.) when recipe.stack.deployTarget is set.
    //     No-op when no target is configured.
    const deploy = await deriveDeploy({ plan, outputDir: tempDir })

    // 5. Emit metadata
    await writeFile(
      path.join(tempDir, 'recipe.json'),
      JSON.stringify(plan.resolvedRecipe.recipe, null, 2) + '\n',
      'utf-8',
    )
    await writeFile(
      path.join(tempDir, '.b-dash-version'),
      `${RENDER_VERSION}\n`,
      'utf-8',
    )
    // Module-version manifest — feeds the changelog parser in `b-dash
    // upgrade` so version bumps can be categorized safe/review/breaking
    // by reading each module's CHANGELOG.md.
    await writeFile(
      path.join(tempDir, '.b-dash-modules.json'),
      JSON.stringify(
        {
          version: 1,
          generatedAt: new Date(plan.resolvedRecipe.recipe.createdAt).toISOString(),
          modules: Object.fromEntries(
            plan.resolvedRecipe.modules
              .map((m) => [m.id, m.manifest.version] as const)
              .sort(([a], [b]) => a.localeCompare(b)),
          ),
        },
        null,
        2,
      ) + '\n',
      'utf-8',
    )
    await writeFile(
      path.join(tempDir, 'README.md'),
      buildReadme(plan, allCopies.length),
      'utf-8',
    )

    // Atomic promote — moves temp → output, preserving any existing
    // overrides/ tree from the prior render.
    await promote(tempDir, outputDir)

    // Overlay overrides/ on top of the fresh render. After this step,
    // any file under overrides/ replaces its generated counterpart.
    const overlay = await overlayOverrides(outputDir)

    return {
      outputDir,
      moduleCount: plan.resolvedRecipe.modules.length,
      fileCount: allCopies.length,
      files: allCopies,
      overrides: overlay.files,
      deploy,
    }
  } catch (e) {
    await rollback(tempDir)
    throw e
  }
}

function buildReadme(plan: WirePlan, fileCount: number): string {
  const r = plan.resolvedRecipe.recipe
  const modules = plan.resolvedRecipe.modules.map((m) => `- ${m.id} v${m.version}`).join('\n')
  // Deterministic: derive the "generated on" line from the recipe's
  // createdAt so re-rendering the same recipe yields a byte-identical
  // README. Otherwise the overrides-overlay conflict detector would
  // flag every regen as a fake conflict (timestamp shifted).
  return `# ${r.branding.name}

Generated by B-Dash from recipe ${r.id} (recipe createdAt: ${r.createdAt}).
b-dash render version: ${RENDER_VERSION}

- Stack: ${r.stack.backend} + ${r.stack.frontend} + ${r.stack.database}
- Theme: ${plan.resolvedRecipe.theme.pack}
- Modules (${plan.resolvedRecipe.modules.length}):
${modules}

Files emitted: ${fileCount}

## What's included (Phase 1 Chunk C MVP)

This is a partial render — module files only. Base scaffolding (Next.js
package.json, FastAPI main.py, Tailwind config) will be added in Chunk C2.

## Customize

Edit any file under \`backend/\` or \`frontend/\`. Drop replacements under
\`overrides/<same-path>/\` to preserve them across regenerations.
`
}
