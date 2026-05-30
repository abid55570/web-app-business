/**
 * `b-dash deploy <project-dir>`
 *
 * Reads `<project-dir>/recipe.json`, looks at `stack.deployTarget`, and
 * prints the next-step deploy command for that target. Doesn't run the
 * deploy itself — pipelines should call the platform CLI directly.
 *
 * Verifies the expected config files exist (they're emitted by the
 * wirer's `deriveDeploy` step at render time). If they don't, prints
 * a hint to re-run `b-dash generate`.
 */
import { access, readFile } from 'node:fs/promises'
import path from 'node:path'
import kleur from 'kleur'


type Target = 'vercel' | 'render' | 'railway' | 'coolify-vps' | 'docker-zip'

type TargetSpec = {
  expectFiles: string[]
  command: string
  /** One-liner shown in the report header. */
  blurb: string
}


const SPECS: Record<Target, TargetSpec> = {
  vercel: {
    expectFiles: ['vercel.json', '.vercelignore'],
    command: 'vercel deploy --prod',
    blurb: 'Deploy to Vercel (frontend), point your API at Render/Railway.',
  },
  render: {
    expectFiles: ['render.yaml'],
    command: 'render blueprints deploy --file render.yaml',
    blurb: 'Apply the render.yaml blueprint via the Render CLI.',
  },
  railway: {
    expectFiles: ['railway.toml', 'nixpacks.toml'],
    command: 'railway up',
    blurb: 'Push the project to Railway via railway up.',
  },
  'coolify-vps': {
    expectFiles: ['Dockerfile', 'docker-compose.yml', '.coolify/coolify.yml'],
    command:
      'git push <coolify-remote> main   # Coolify auto-builds from the connected git remote.',
    blurb: 'Coolify auto-builds the docker bundle from a git push.',
  },
  'docker-zip': {
    expectFiles: ['Dockerfile', 'docker-compose.yml', '.dockerignore'],
    command: 'docker compose up --build',
    blurb: 'Run the Dockerfile + compose locally / on any VPS.',
  },
}


async function exists(p: string): Promise<boolean> {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}


export async function runDeploy(args: string[]): Promise<number> {
  const projectDir = args[0] ? path.resolve(args[0]) : process.cwd()
  if (!(await exists(projectDir))) {
    process.stderr.write(
      kleur.red(`Project directory not found: ${projectDir}\n`),
    )
    return 1
  }

  const recipePath = path.join(projectDir, 'recipe.json')
  if (!(await exists(recipePath))) {
    process.stderr.write(
      kleur.red(
        `No recipe.json at ${recipePath}. ` +
          `Did you run \`b-dash generate\` here first?\n`,
      ),
    )
    return 1
  }

  let recipe
  try {
    recipe = JSON.parse(await readFile(recipePath, 'utf-8'))
  } catch {
    process.stderr.write(
      kleur.red(`recipe.json is not valid JSON at ${recipePath}\n`),
    )
    return 1
  }

  const target = recipe?.stack?.deployTarget as Target | undefined
  if (!target) {
    process.stdout.write(
      kleur.yellow(
        `No deploy target set in recipe.json (stack.deployTarget).\n`,
      ) +
        kleur.dim(
          `Pick one of: ${Object.keys(SPECS).join(' / ')}\n`,
        ) +
        kleur.dim(
          `then re-run \`b-dash generate\` to emit the matching config files.\n`,
        ),
    )
    return 0
  }

  const spec = SPECS[target]
  if (!spec) {
    process.stderr.write(
      kleur.red(`Unknown deploy target: ${target}\n`),
    )
    return 2
  }

  // Verify the expected config files actually exist.
  const missing: string[] = []
  for (const f of spec.expectFiles) {
    if (!(await exists(path.join(projectDir, f)))) missing.push(f)
  }
  if (missing.length > 0) {
    process.stderr.write(
      kleur.red(
        `Expected deploy config files are missing for target '${target}':\n` +
          missing.map((m) => `  - ${m}`).join('\n') +
          '\n',
      ) +
        kleur.dim(
          `Re-run \`b-dash generate\` from a workspace that includes the latest wirer.\n`,
        ),
    )
    return 1
  }

  // Happy path: print the target + suggested command.
  process.stdout.write(
    kleur.bold(`Deploy target: ${kleur.cyan(target)}\n`) +
      `  project: ${kleur.cyan(projectDir)}\n` +
      `  ${kleur.dim(spec.blurb)}\n` +
      `  files:   ${kleur.dim(spec.expectFiles.join(' · '))}\n\n` +
      kleur.bold('Run:\n') +
      `  ${kleur.green(spec.command)}\n\n` +
      kleur.dim(
        `Tip: env keys auto-inferred from your module list are listed in the deploy config.\n`,
      ),
  )
  return 0
}
