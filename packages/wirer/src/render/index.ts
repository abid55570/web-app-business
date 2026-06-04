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
import { derivePage } from './derive-page.js'
import { deriveAuthPages } from './derive-auth-pages.js'
import { deriveExtraPages } from './derive-extra-pages.js'
import { deriveProductionDocs } from './derive-production-docs.js'
import { deriveElementIds } from './derive-element-ids.js'
import { deriveElementBindings } from './derive-element-bindings.js'
import { deriveStudioBridge } from './derive-studio-bridge.js'
import { deriveApplyOverrides } from './derive-apply-overrides.js'
import { stripUnused } from './strip-unused.js'
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
    //     Copies discovered sections into <out>/frontend/src/sections/<id>/.
    //     When `recipe.sections` is set, ONLY listed ids ship (keeps
    //     wizard-generated apps small). When omitted, EVERY section ships
    //     (legacy: Studio's full drag palette needs the full catalogue).
    if (sectionsRoot) {
      const { scanSections } = await import('../load.js')
      const allSections = await scanSections(sectionsRoot)
      const allow = (plan.resolvedRecipe.recipe as { sections?: string[] }).sections
      const sections = Array.isArray(allow)
        ? allSections.filter((s) => allow.includes(s.id))
        : allSections
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

    // 2c. Compose a real homepage from recipe.sections. Without this, the
    //     scaffold's hardcoded "Hello." page.tsx ships unchanged and the
    //     copied sections sit orphaned in src/sections/. Plan §19.1 step 8.
    //     Passes sectionsRoot so derive-page can synth safe defaults from
    //     section.yaml for any section it doesn't manually template.
    await derivePage({ plan, outputDir: tempDir, sectionsRoot })

    // 2d. Emit /login + /signup + /dashboard pages when auth-jwt ships.
    //     Wires the landing-page CTA to a real account-creation funnel
    //     instead of dead-ending at a 404. Also writes next.config.ts
    //     with an /api/* → FastAPI rewrite so the forms work in dev.
    await deriveAuthPages({ plan, outputDir: tempDir })

    // 2e. Emit /pricing, /about, /contact, /docs, /blog when the wizard's
    //     "extra pages" step ticked any of them. Each gets a dark-themed
    //     page composed from existing premium sections + shared header/
    //     footer for cross-page nav.
    await deriveExtraPages({ plan, outputDir: tempDir })

    // 2f. PRODUCTION.md + .env.production.example templates so the user
    //     has a real path from `pnpm dev` to a live URL — Docker / VPS,
    //     Vercel + Render, or Railway. Always emits, even on docker-zip.
    await deriveProductionDocs({ plan, outputDir: tempDir })

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

    // Isolate generated app from any ancestor pnpm workspace (e.g. when
    // output/ lives inside the b-dash monorepo). Without these markers,
    // `cd <out>/frontend && pnpm install` climbs to the b-dash workspace
    // root and installs THAT instead of the generated frontend.
    //  - pnpm-workspace.yaml at the generated app root makes it the
    //    nearest workspace ancestor pnpm finds.
    //  - .npmrc with `ignore-workspace-root-check=true` keeps the install
    //    quiet when the user runs pnpm directly at the app root.
    await writeFile(
      path.join(tempDir, 'pnpm-workspace.yaml'),
      'packages:\n  - frontend\n  - backend\n',
      'utf-8',
    )
    await writeFile(
      path.join(tempDir, '.npmrc'),
      'ignore-workspace-root-check=true\nshared-workspace-lockfile=false\n',
      'utf-8',
    )

    // One-shot run scripts. Non-tech users get a single double-clickable
    // entry point instead of remembering cd + install + dev.
    //
    // Named `run.bat` (NOT `start.bat`) because `start` is a cmd.exe
    // builtin and `start.bat` from a fresh prompt resolves to the builtin
    // instead of the script in many shells (PowerShell needs `.\start.bat`).
    // `run.bat` has no such collision and works from cmd, PowerShell, and
    // Explorer double-click.
    await writeFile(
      path.join(tempDir, 'run.bat'),
      [
        '@echo off',
        'setlocal',
        'cd /d "%~dp0frontend"',
        'echo.',
        'echo === Installing frontend deps (first run only)...',
        'call pnpm install',
        'if errorlevel 1 (',
        '  echo FAILED to install. Make sure pnpm is installed: npm install -g pnpm',
        '  pause',
        '  exit /b 1',
        ')',
        'echo.',
        'echo === Starting dev server on http://localhost:3000',
        'echo === Press Ctrl+C to stop.',
        'echo.',
        'call pnpm dev',
        '',
      ].join('\r\n'),
      'utf-8',
    )
    await writeFile(
      path.join(tempDir, 'run.sh'),
      [
        '#!/usr/bin/env bash',
        'set -e',
        'cd "$(dirname "$0")/frontend"',
        'echo "=== Installing frontend deps (first run only)..."',
        'pnpm install',
        'echo "=== Starting dev server on http://localhost:3000"',
        'echo "=== Press Ctrl+C to stop."',
        'pnpm dev',
        '',
      ].join('\n'),
      'utf-8',
    )

    // Backend run scripts — only emitted if a backend was scaffolded.
    // FastAPI: uvicorn on port 8000; venv created on first run.
    if (plan.resolvedRecipe.recipe.stack.backend === 'fastapi') {
      await writeFile(
        path.join(tempDir, 'run-backend.bat'),
        [
          '@echo off',
          'setlocal',
          'cd /d "%~dp0backend"',
          'if not exist .venv (',
          '  echo === Creating Python venv...',
          '  python -m venv .venv',
          ')',
          'call .venv\\Scripts\\activate.bat',
          'echo === Installing backend deps (first run only)...',
          'pip install -e ".[dev]"',
          'if errorlevel 1 (',
          '  echo FAILED. Make sure Python 3.11+ is installed.',
          '  pause',
          '  exit /b 1',
          ')',
          'echo.',
          'echo === Starting API on http://localhost:8000',
          'echo === Press Ctrl+C to stop.',
          'echo.',
          'uvicorn app.main:app --reload --port 8000',
          '',
        ].join('\r\n'),
        'utf-8',
      )
      await writeFile(
        path.join(tempDir, 'run-backend.sh'),
        [
          '#!/usr/bin/env bash',
          'set -e',
          'cd "$(dirname "$0")/backend"',
          '[ -d .venv ] || python3 -m venv .venv',
          'source .venv/bin/activate',
          'pip install -e ".[dev]"',
          'echo "=== Starting API on http://localhost:8000"',
          'uvicorn app.main:app --reload --port 8000',
          '',
        ].join('\n'),
        'utf-8',
      )
    }

    // Sprint 1 — Studio v2 foundation: inject data-bd-element="<id>:e<n>"
    // attrs on every interesting HTML JSX tag inside section files so the
    // Studio iframe-bridge can address each element for selection +
    // inline editing in Sprint 2. Idempotent (skips files already tagged).
    await deriveElementIds({ outputDir: tempDir })

    // Sprint 5a — build element→section-prop binding map so Studio can
    // edit JSX-expression text (e.g. <h1>{title}</h1> → edit `title` prop)
    // instead of being blocked by the text-only patch policy. Runs after
    // element-IDs are present.
    await deriveElementBindings({ outputDir: tempDir })

    // Sprint 2a — ship _studio-bridge.js + inject <script> into layout.tsx
    // so Studio can postMessage with the iframe for click-to-select.
    // Bridge is a no-op when not embedded in an iframe (prod-safe).
    await deriveStudioBridge({ outputDir: tempDir })

    // Sprint 2b — carry forward any existing studio-overrides.json from
    // the prior output (Studio writes element-level patches there). The
    // apply-overrides step below reads from tempDir and patches the
    // freshly-copied section files.
    try {
      const { readFile: rf, writeFile: wf } = await import('node:fs/promises')
      const prev = await rf(path.join(outputDir, 'studio-overrides.json'), 'utf-8')
      await wf(path.join(tempDir, 'studio-overrides.json'), prev, 'utf-8')
    } catch {
      // No prior overrides — fine.
    }

    // Apply the element-level overrides AFTER element-IDs exist + AFTER
    // bridge is in place. Patches data-bd-element-tagged JSX in copied
    // section .tsx files (text content, className) before promote so
    // the user's edits survive regen.
    await deriveApplyOverrides({ outputDir: tempDir })

    // Strip files the chosen recipe does not actually need (wizard mode
    // only — hand-authored recipes get the full scaffold). Cuts out
    // shadcn UI primitives, API client, e2e specs for absent modules,
    // .studio.json siblings, dev-only configs, and the backend tree
    // entirely when no server-side module survived.
    await stripUnused({ plan, outputDir: tempDir })

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
