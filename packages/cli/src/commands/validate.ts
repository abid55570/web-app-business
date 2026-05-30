/**
 * `b-dash validate <file> [--as <type>]`
 *
 * Reads a JSON or YAML file, validates it against the schema for the inferred
 * (or explicit) artifact type, and prints either a green check or a structured
 * multi-line error.
 */
import path from 'node:path'
import kleur from 'kleur'
import {
  IntentSchema,
  ModuleSchema,
  RecipeSchema,
  SchemaValidationError,
  ThemeManifestSchema,
  TokensSchema,
  loadAndValidate,
} from '@b-dash/schemas'

type Artifact = 'recipe' | 'module' | 'theme' | 'tokens' | 'intent'

const SCHEMAS = {
  recipe: RecipeSchema,
  module: ModuleSchema,
  theme: ThemeManifestSchema,
  tokens: TokensSchema,
  intent: IntentSchema,
} as const

/** Guess the artifact type from the file name. */
export function inferArtifact(filePath: string): Artifact | null {
  const base = path.basename(filePath).toLowerCase()
  if (base === 'recipe.json' || base.endsWith('.recipe.json')) return 'recipe'
  if (base === 'module.yaml' || base === 'module.yml') return 'module'
  if (base === 'theme.yaml' || base === 'theme.yml') return 'theme'
  if (base === 'tokens.json' || base.endsWith('.tokens.json')) return 'tokens'
  if (base === 'intent.yaml' || base === 'intent.yml') return 'intent'
  return null
}

function parseArgs(args: string[]): { file: string | null; artifact: Artifact | null } {
  let file: string | null = null
  let artifact: Artifact | null = null
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--as') {
      const next = args[i + 1]
      if (!next) throw new Error('--as flag requires a value (recipe|module|theme|tokens|intent)')
      if (!(next in SCHEMAS)) {
        throw new Error(`Unknown artifact type '${next}'. Expected one of: ${Object.keys(SCHEMAS).join(', ')}`)
      }
      artifact = next as Artifact
      i++
    } else if (a && !a.startsWith('-') && file === null) {
      file = a
    }
  }
  return { file, artifact }
}

export async function runValidate(args: string[]): Promise<number> {
  let file: string | null
  let explicit: Artifact | null
  try {
    ;({ file, artifact: explicit } = parseArgs(args))
  } catch (e) {
    process.stderr.write(kleur.red(`✗ ${(e as Error).message}\n`))
    return 1
  }

  if (!file) {
    process.stderr.write(
      kleur.red('Usage: b-dash validate <file> [--as <recipe|module|theme|tokens|intent>]\n'),
    )
    return 2
  }

  const artifact = explicit ?? inferArtifact(file)
  if (!artifact) {
    process.stderr.write(
      kleur.red(
        `Could not infer artifact type from '${path.basename(file)}'.\n`,
      ) +
        kleur.dim(
          'Use --as to specify (e.g. --as module).\n' +
            'Inferred names: recipe.json, module.yaml, theme.yaml, tokens.json, intent.yaml.\n',
        ),
    )
    return 2
  }

  const schema = SCHEMAS[artifact]

  try {
    await loadAndValidate(schema, file, artifact)
    process.stdout.write(
      kleur.green('✓ ') +
        `${file} is a valid ${kleur.bold(artifact)}.\n`,
    )
    return 0
  } catch (e) {
    if (e instanceof SchemaValidationError) {
      process.stderr.write(kleur.red('✗ ') + e.format() + '\n')
      return 1
    }
    throw e
  }
}
