/**
 * File loaders that parse + validate JSON / YAML against a Zod schema.
 *
 * Used by the CLI (`b-dash validate`), the wirer (`load module/theme/...`),
 * and the wizard (loads existing recipes for "resume draft").
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { parse as parseYaml } from 'yaml'
import { type ZodTypeAny, z } from 'zod'
import { SchemaValidationError } from './errors.js'

type Artifact =
  | 'recipe'
  | 'module'
  | 'theme'
  | 'starter'
  | 'intent'
  | 'tokens'
  | 'section'

type Format = 'json' | 'yaml'

function detectFormat(filePath: string): Format {
  const ext = path.extname(filePath).toLowerCase()
  if (ext === '.json') return 'json'
  if (ext === '.yaml' || ext === '.yml') return 'yaml'
  // Programmer error — bad input, not a schema problem. Propagate unwrapped.
  throw new Error(
    `Unsupported file extension '${ext}' for '${filePath}'. Expected .json, .yaml, or .yml.`,
  )
}

function parseRaw(format: Format, raw: string): unknown {
  // Strip a leading UTF-8 BOM if present — common when files are saved
  // by Notepad / PowerShell `Set-Content -Encoding utf8` / VS Code (when
  // configured). JSON.parse doesn't tolerate a leading BOM.
  const cleaned = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw
  return format === 'json' ? JSON.parse(cleaned) : parseYaml(cleaned)
}

/**
 * Validate already-parsed data against a schema.
 *
 * Generic is `S extends ZodTypeAny` (not `ZodSchema<T>`) so `z.infer<S>`
 * resolves to the OUTPUT type — i.e. defaults are applied (`.default([])`
 * becomes `string[]`, not `string[] | undefined`).
 */
export function validate<S extends ZodTypeAny>(
  schema: S,
  data: unknown,
  artifact: Artifact,
  pathHint: string | null = null,
): z.infer<S> {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new SchemaValidationError(artifact, pathHint, result.error.issues)
  }
  return result.data
}

/** Load + parse + validate a file. */
export async function loadAndValidate<S extends ZodTypeAny>(
  schema: S,
  filePath: string,
  artifact: Artifact,
): Promise<z.infer<S>> {
  // detectFormat throws unwrapped on bad extensions — that's a caller bug,
  // not a schema problem.
  const format = detectFormat(filePath)
  const raw = await readFile(filePath, 'utf-8')
  let parsed: unknown
  try {
    parsed = parseRaw(format, raw)
  } catch (e) {
    throw new SchemaValidationError(artifact, filePath, [
      {
        code: z.ZodIssueCode.custom,
        path: [],
        message: `failed to parse file: ${(e as Error).message}`,
      },
    ])
  }
  return validate(schema, parsed, artifact, filePath)
}
