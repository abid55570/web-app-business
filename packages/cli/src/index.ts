/**
 * b-dash CLI entry point.
 *
 * Usage:
 *   b-dash validate <file> [--as <recipe|module|theme|tokens|intent>]
 *   b-dash list contracts | starters | themes | sections | modules
 *   b-dash --version
 *   b-dash --help
 */
import kleur from 'kleur'
import { runDeploy } from './commands/deploy.js'
import { runDiff } from './commands/diff.js'
import { runGenerate } from './commands/generate.js'
import { runList } from './commands/list.js'
import { runNew } from './commands/new.js'
import { runStudio } from './commands/studio.js'
import { runUpgrade } from './commands/upgrade.js'
import { runValidate } from './commands/validate.js'
import { runWizard } from './commands/wizard.js'

const VERSION = '0.1.0'

const HELP = `
${kleur.bold('b-dash')} — B-Dash app generator CLI (v${VERSION})

${kleur.bold('Commands:')}
  ${kleur.cyan('wizard')}                          Interactive recipe builder (writes <root>/recipes/<id>.json)
  ${kleur.cyan('validate')} <file> [--as <type>]   Validate a recipe / module / theme / tokens / intent file
  ${kleur.cyan('diff')} <recipe.json>              Build + print a wire plan (modules in order, events, conflicts)
  ${kleur.cyan('generate')} <recipe.json> [--out] [--install] [--smoke] [--zip]
                                  Render an app to disk (default: <root>/output/<id>/)
                                  --install: pnpm install + pip install -e .[dev]
                                  --smoke:   run pytest tests/ in backend/ + vitest in frontend/
                                  --zip:     pack the result into <out>.zip for distribution
  ${kleur.cyan('new')} --from <starter> [--out <dir>] [--name <brand>] [--install] [--smoke]
                                  Scaffold a new app from a starter (see ${kleur.cyan('list starters')})
  ${kleur.cyan('upgrade')} <project-dir>           Re-render an existing project against the current workspace;
                                  preserves overrides/, reports conflicts.
  ${kleur.cyan('deploy')} <project-dir>            Print the deploy command for recipe.stack.deployTarget
                                  (vercel | render | railway | coolify-vps | docker-zip).
  ${kleur.cyan('list')} <what>                     List inventory: contracts | starters | themes | sections | modules
  ${kleur.cyan('studio')} <project-dir> [--port]   Phase 4 stub viewer at :3001 (manifests + studio-state.json)
  ${kleur.cyan('--version')}                       Print version and exit
  ${kleur.cyan('--help')}                          Print this help and exit

${kleur.bold('Examples:')}
  b-dash validate recipe.json
  b-dash diff path/to/recipe.json
  b-dash generate path/to/recipe.json
  b-dash list contracts
  b-dash list starters
  b-dash list themes
  b-dash new --from saas-jwt --out ./acme --name "Acme Cloud"
`

export async function main(argv: string[]): Promise<number> {
  const args = argv.slice(2)

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    process.stdout.write(HELP)
    return 0
  }

  if (args[0] === '--version' || args[0] === '-v') {
    process.stdout.write(VERSION + '\n')
    return 0
  }

  const command = args[0]

  try {
    switch (command) {
      case 'wizard':
        return await runWizard(args.slice(1))
      case 'validate':
        return await runValidate(args.slice(1))
      case 'diff':
        return await runDiff(args.slice(1))
      case 'generate':
        return await runGenerate(args.slice(1))
      case 'new':
        return await runNew(args.slice(1))
      case 'upgrade':
        return await runUpgrade(args.slice(1))
      case 'deploy':
        return await runDeploy(args.slice(1))
      case 'list':
        return await runList(args.slice(1))
      case 'studio':
        return await runStudio(args.slice(1))
      default:
        process.stderr.write(
          kleur.red(`Unknown command: ${command}\n`) +
            kleur.dim('Run b-dash --help for usage.\n'),
        )
        return 2
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    process.stderr.write(kleur.red(`Error: ${msg}\n`))
    return 1
  }
}

// Auto-run when invoked as a bin (i.e. not when imported by tests).
const isMain = import.meta.url.endsWith(process.argv[1]?.replace(/\\/g, '/') ?? '')
if (isMain) {
  main(process.argv).then((code) => process.exit(code))
}
